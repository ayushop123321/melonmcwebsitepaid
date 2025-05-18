// This script adds a test announcement to localStorage
// Run this in your browser console to add a test announcement

(function() {
    try {
        // Create a unique ID
        const id = 'test_announcement_' + Date.now();
        const timestamp = new Date().toISOString();
        
        // Create announcement object
        const testAnnouncement = {
            id,
            title: 'Test Announcement ' + new Date().toLocaleTimeString(),
            content: 'This is a test announcement created to verify that the announcements system is working correctly. The current time is ' + new Date().toLocaleTimeString(),
            type: 'update',
            timestamp,
            createdBy: 'test-script'
        };
        
        // Get existing announcements or create empty array
        const existingAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
        
        // Add new announcement at the beginning
        existingAnnouncements.unshift(testAnnouncement);
        
        // Save back to localStorage
        localStorage.setItem('announcements', JSON.stringify(existingAnnouncements));
        
        // Create sync trigger
        const syncTrigger = {
            action: 'sync_announcements',
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('announcement_sync_trigger', JSON.stringify(syncTrigger));
        
        console.log('Test announcement created successfully!');
        console.log('Announcement details:', testAnnouncement);
        console.log('Total announcements in localStorage:', existingAnnouncements.length);
        
        // Return true so user can see if it worked
        return true;
    } catch (error) {
        console.error('Error creating test announcement:', error);
        return false;
    }
})(); 