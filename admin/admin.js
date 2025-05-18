// Admin Panel JavaScript - Firebase Version

// Initialize Firebase with better error handling
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, initializing admin page');
    handleHashChange();
    
    // Auto-login helper function
    function autoLogin() {
        const usernameField = document.getElementById('username');
        if (usernameField && usernameField.value === 'Biltubhaiandharshbhaiophai123') {
            console.log('Auto-login detected');
            // Trigger form submission automatically
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                console.log('Submitting form automatically');
                // Dispatch submit event on the form
                const submitEvent = new Event('submit', {
                    bubbles: true,
                    cancelable: true
                });
                loginForm.dispatchEvent(submitEvent);
            }
        }
    }
    
    // Auto-check for the username on page load
    setTimeout(autoLogin, 500);
    
    // Also check when input changes
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.addEventListener('input', function() {
            if (this.value === 'Biltubhaiandharshbhaiophai123') {
                autoLogin();
            }
        });
    }
    
    // Auto-redirect if already logged in on login page
    if (window.location.hash === '' || window.location.hash === '#') {
        const adminLoggedIn = localStorage.getItem('adminLoggedIn');
        const adminUsername = localStorage.getItem('adminUsername');
        
        if (adminLoggedIn === 'true' && adminUsername === 'Biltubhaiandharshbhaiophai123') {
            console.log('Admin already logged in, redirecting to dashboard');
            window.location.hash = '#dashboard';
        }
    }
    
    // Firebase configuration - with fallback mechanisms
    const firebaseConfig = {
        apiKey: "AIzaSyBwxuW2cdXbwGAkx91kQD9Nk4GhF1vReHQ",
        authDomain: "melonmc-admin.firebaseapp.com",
        projectId: "melonmc-admin",
        storageBucket: "melonmc-admin.appspot.com",
        messagingSenderId: "123456789012",
        appId: "1:123456789012:web:abcdef1234567890abcdef"
    };
    
    // Firebase services
    let auth, db, rtDb;
    let firebaseInitialized = false;
    
    // Try to initialize Firebase
    try {
        // Check if Firebase app is already initialized
        if (typeof firebase === 'undefined') {
            console.error("Firebase SDK not loaded");
            showNotification("Admin panel running in offline mode. Firebase SDK not found.", "warning");
            firebaseInitialized = false;
        } else {
            // Initialize Firebase if not already initialized
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
                console.log("Firebase app initialized");
            } else {
                console.log("Using existing Firebase app");
            }
            
            // Initialize services with individual try/catch blocks
            try {
                auth = firebase.auth();
                console.log("Firebase Auth initialized");
            } catch (authError) {
                console.error("Error initializing Firebase Auth:", authError);
                showNotification("Firebase Authentication unavailable", "warning");
            }
            
            try {
                db = firebase.firestore();
                console.log("Firebase Firestore initialized");
            } catch (firestoreError) {
                console.error("Error initializing Firestore:", firestoreError);
                showNotification("Firestore database unavailable", "warning");
            }
            
            try {
                rtDb = firebase.database();
                console.log("Firebase Realtime Database initialized");
            } catch (rtdbError) {
                console.error("Error initializing Realtime Database:", rtdbError);
                showNotification("Realtime Database unavailable", "warning");
            }
            
            // Set initialized flag if we have at least Firestore
            if (db) {
                firebaseInitialized = true;
                console.log("Firebase initialized successfully");
            } else {
                showNotification("Admin panel running in offline mode. Some features may be limited.", "warning");
                firebaseInitialized = false;
            }
        }
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        showNotification("Admin panel running in offline mode. Some features may be limited.", "warning");
        firebaseInitialized = false;
    }
    
    // Tracking for click events and user activity - with enhanced error handling
    const trackActivity = async (action, details = {}, status = 'success') => {
        try {
            const timestamp = new Date().toISOString();
            const username = localStorage.getItem('adminUsername') || 'guest';
            let ip = 'local';
            
            try {
                ip = await getUserIP();
            } catch (ipError) {
                console.warn("Could not get IP address:", ipError);
            }
            
            // Create log data object
            const logData = {
                username,
                ip,
                timestamp,
                action,
                details: JSON.stringify(details),
                status,
                createdAt: timestamp
            };
            
            // Only try Firebase operations if initialized
            if (firebaseInitialized && db && rtDb) {
                try {
                    // Add Firestore timestamp if available
                    if (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) {
                        logData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    }
                    
                    // Log to Firestore
                    if (db && db.collection) {
                        await db.collection('activityLogs').add(logData);
                    }
                    
                    // Log to Realtime Database for immediate updates
                    if (rtDb && rtDb.ref) {
                        const newLogRef = rtDb.ref('activityLogs').push();
                        await newLogRef.set({
                            ...logData,
                            // Convert Firestore timestamp to a format RTDB can handle
                            createdAt: new Date().getTime()
                        });
                        
                        // Update counters
                        const counterRef = rtDb.ref('logCounters');
                        counterRef.transaction((counters) => {
                            if (!counters) counters = {};
                            if (!counters.total) counters.total = 0;
                            counters.total++;
                            
                            if (status === 'failed') {
                                if (!counters.failed) counters.failed = 0;
                                counters.failed++;
                            }
                            
                            const today = new Date().toISOString().split('T')[0];
                            if (!counters[today]) counters[today] = 0;
                            counters[today]++;
                            
                            return counters;
                        });
                    }
                } catch (firebaseError) {
                    console.error("Firebase activity logging failed:", firebaseError);
                    // Fall back to localStorage
                    fallbackToLocalStorage(logData);
                }
            } else {
                // Firebase not available, use localStorage
                fallbackToLocalStorage(logData);
            }
        } catch (error) {
            console.error("Error tracking activity:", error);
            
            // Always ensure we have a fallback record
            try {
                const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
                logs.push({
                    username: localStorage.getItem('adminUsername') || 'guest',
                    ip: 'local',
                    timestamp: new Date().toISOString(),
                    action,
                    details: JSON.stringify(details),
                    status
                });
                localStorage.setItem('activityLogs', JSON.stringify(logs));
            } catch (localError) {
                console.error("Complete activity tracking failure:", localError);
            }
        }
    };
    
    // Helper function for localStorage fallback
    function fallbackToLocalStorage(logData) {
        try {
            const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
            logs.push(logData);
            // Keep only the most recent 100 logs to prevent storage issues
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            localStorage.setItem('activityLogs', JSON.stringify(logs));
        } catch (e) {
            console.error("LocalStorage fallback failed:", e);
        }
    }
    
    // Track all clicks in the admin panel
    document.addEventListener('click', async function(e) {
        // Don't track clicks in login section
        if (loginSection.style.display !== 'none') return;
        
        const target = e.target;
        let actionElement = target;
        let action = 'view';
        let details = { element: target.tagName };
        
        // Try to get a more meaningful element if clicked on an icon or span
        if (['I', 'SPAN'].includes(target.tagName) && target.parentElement) {
            actionElement = target.parentElement;
        }
        
        // Identify the action type
        if (actionElement.classList.contains('edit-btn')) action = 'edit';
        else if (actionElement.classList.contains('delete-btn')) action = 'delete';
        else if (actionElement.classList.contains('save-btn')) action = 'save';
        else if (actionElement.classList.contains('add-new-btn')) action = 'add';
        else if (actionElement.classList.contains('refresh-btn')) action = 'refresh';
        
        // Get more context for the action
        if (actionElement.getAttribute('data-panel')) {
            details.panel = actionElement.getAttribute('data-panel');
            action = 'navigate';
        }
        
        // Get text content for more context
        if (actionElement.textContent.trim()) {
            details.text = actionElement.textContent.trim().substring(0, 50);
        }
        
        // Get action target if available
        if (actionElement.getAttribute('id')) {
            details.id = actionElement.getAttribute('id');
        }
        
        // Log the click activity
        await trackActivity(action, details);
    });
    
    // Login Section
    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loggedUserDisplay = document.getElementById('logged-user-display');
    const deleteModal = document.getElementById('delete-confirmation-modal');
    
    // Anonymous authentication for Firebase (no password required)
    const signInAnonymously = () => {
        return auth.signInAnonymously()
            .catch((error) => {
                console.error("Error signing in anonymously:", error);
            });
    };
    
    // Get User IP Address
    const getUserIP = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error("Error getting IP:", error);
            return "Unknown";
        }
    };
    
    // Log access attempt
    const logAccessAttempt = async (username, isSuccess) => {
        const timestamp = new Date().toISOString();
        const ip = await getUserIP();
        
        // Add to Firestore for permanent storage
        try {
            await db.collection('accessLogs').add({
                username,
                ip,
                timestamp,
                action: 'login',
                details: JSON.stringify({ loginAttempt: true }),
                status: isSuccess ? 'success' : 'failed',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Error logging access:", error);
            
            // Fallback to localStorage
            const logs = JSON.parse(localStorage.getItem('accessLogs') || '[]');
            logs.push({
                username,
                ip,
                timestamp,
                action: 'login',
                details: JSON.stringify({ loginAttempt: true }),
                status: isSuccess ? 'success' : 'failed'
            });
            localStorage.setItem('accessLogs', JSON.stringify(logs));
        }
        
        // Add to realtime database for immediate updates
        try {
            const newLogRef = rtDb.ref('activityLogs').push();
            await newLogRef.set({
                username,
                ip,
                timestamp,
                action: 'login',
                details: JSON.stringify({ loginAttempt: true }),
                status: isSuccess ? 'success' : 'failed'
            });
            
            // Update counters
            const counterRef = rtDb.ref('logCounters');
            counterRef.transaction((counters) => {
                if (!counters) counters = {};
                if (!counters.total) counters.total = 0;
                counters.total++;
                
                if (!isSuccess) {
                    if (!counters.failed) counters.failed = 0;
                    counters.failed++;
                }
                
                const today = new Date().toISOString().split('T')[0];
                if (!counters[today]) counters[today] = 0;
                counters[today]++;
                
                return counters;
            });
        } catch (error) {
            console.error("Error adding to real-time DB:", error);
        }
    };
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            // Allow multiple admin usernames for access (case insensitive)
            const validAdmins = ['BiltuBhaiOP', 'Biltubhaiandharshbhaiophai123', 'MelonAdmin', 'admin'];
            const isAdmin = validAdmins.some(admin => admin.toLowerCase() === username.toLowerCase());
            
            try {
                // Log the access attempt
                await logAccessAttempt(username, isAdmin);
                
                if (isAdmin) {
                    try {
                        // Sign in anonymously to Firebase
                        await signInAnonymously();
                        
                        // Show the dashboard
                        loginSection.style.display = 'none';
                        dashboardSection.style.display = 'flex';
                        
                        // Store login in localStorage for persistence
                        localStorage.setItem('adminLoggedIn', 'true');
                        localStorage.setItem('adminUsername', username);
                        localStorage.setItem('loginTime', new Date().toISOString());
                        
                        // Update the displayed name
                        if (loggedUserDisplay) {
                            loggedUserDisplay.textContent = username;
                            loggedUserDisplay.classList.add('live-indicator');
                        }
                        
                        // Initialize dashboard with real data
                        initializeDashboard();
                        
                        // Load logs
                        loadAccessLogs();
                        
                        // Start real-time updates
                        initializeRealTimeUpdates();
                        
                        showNotification('Login successful. Welcome to admin panel!', 'success');
                    } catch (error) {
                        console.error("Error during login process:", error);
                        // Still allow login even if Firebase failed
                        loginSection.style.display = 'none';
                        dashboardSection.style.display = 'flex';
                        
                        localStorage.setItem('adminLoggedIn', 'true');
                        localStorage.setItem('adminUsername', username);
                        
                        if (loggedUserDisplay) {
                            loggedUserDisplay.textContent = username;
                        }
                        
                        showNotification('Login successful, but some features may be limited.', 'warning');
                    }
                } else {
                    showNotification('Access denied. Invalid username. Please try admin, BiltuBhaiOP, or MelonAdmin', 'error', true);
                    // Display error directly on form
                    const loginForm = document.getElementById('login-form');
                    if (loginForm) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'login-error';
                        errorMsg.style.color = '#ff5757';
                        errorMsg.style.marginTop = '10px';
                        errorMsg.style.padding = '5px';
                        errorMsg.style.borderRadius = '4px';
                        errorMsg.style.backgroundColor = 'rgba(255,0,0,0.1)';
                        errorMsg.textContent = 'Invalid username. Please check and try again.';
                        
                        // Remove existing error messages
                        const existingError = loginForm.querySelector('.login-error');
                        if (existingError) {
                            existingError.remove();
                        }
                        
                        loginForm.appendChild(errorMsg);
                    }
                }
            } catch (error) {
                console.error("Error during login attempt:", error);
                showNotification('Login error. Please try again.', 'error');
            }
        });
    }
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        if (loginSection && dashboardSection) {
            const savedUsername = localStorage.getItem('adminUsername') || 'BiltuBhaiOP';
            
            // Sign in anonymously to Firebase
            signInAnonymously().then(() => {
                loginSection.style.display = 'none';
                dashboardSection.style.display = 'flex';
                
                // Update the displayed name
                if (loggedUserDisplay) {
                    loggedUserDisplay.textContent = savedUsername;
                    loggedUserDisplay.classList.add('live-indicator');
                }
                
                initializeDashboard();
                loadAccessLogs();
                initializeRealTimeUpdates();
                
                // Track session resume
                trackActivity('session_resume', {
                    lastLogin: localStorage.getItem('loginTime')
                });
            });
        }
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        console.log("Attaching logout handler");
        logoutBtn.addEventListener('click', async function() {
            console.log("Logout clicked");
            
            // Track logout action
            try {
                await trackActivity('logout');
            } catch (e) {
                console.error("Error tracking logout:", e);
            }
            
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminUsername');
            
            auth.signOut().then(() => {
                console.log("Firebase signed out");
                if (loginSection && dashboardSection) {
                    dashboardSection.style.display = 'none';
                    loginSection.style.display = 'flex';
                }
            }).catch((error) => {
                console.error("Error signing out: ", error);
                
                // Still log out of local session
                if (loginSection && dashboardSection) {
                    dashboardSection.style.display = 'none';
                    loginSection.style.display = 'flex';
                }
            });
        });
    } else {
        console.error("Logout button not found by ID");
        
        // Try alternative selector
        const altLogoutBtn = document.querySelector('.sidebar-menu li:last-child');
        if (altLogoutBtn) {
            console.log("Found logout button by alternative selector");
            altLogoutBtn.addEventListener('click', function() {
                console.log("Alternative logout clicked");
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminUsername');
                
                if (loginSection && dashboardSection) {
                    dashboardSection.style.display = 'none';
                    loginSection.style.display = 'flex';
                }
                
                auth.signOut().catch(error => {
                    console.error("Error in alternative sign out:", error);
                });
            });
        }
    }
    
    // Menu navigation with tracking
    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li');
    const panels = document.querySelectorAll('.panel-container');
    
    console.log("Found", sidebarMenuItems.length, "menu items and", panels.length, "panels");
    
    // Add panel IDs logging for debugging
    panels.forEach(panel => {
        console.log("Panel ID:", panel.id);
    });

    // Debug menu click events
    document.querySelector('.sidebar-menu').addEventListener('click', function(e) {
        console.log("Sidebar menu clicked", e.target);
    });

    // Direct navigation approach - more reliable than using loops
    function setupMenuNavigation() {
        console.log("Setting up direct menu navigation");
        
        // Helper function to handle panel switching
        function switchToPanel(panelId) {
            console.log("Switching to panel:", panelId);
            
            try {
                // First hide all panels
                document.querySelectorAll('.panel-container').forEach(panel => {
                    panel.classList.remove('active');
                    panel.style.display = 'none';
                });
                
                // Show the selected panel
                const targetPanel = document.getElementById(panelId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.style.display = 'block';
                    console.log("Panel activated:", panelId);
                    
                    // Remove active class from all menu items
                    document.querySelectorAll('.sidebar-menu li').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to the clicked menu item
                    const menuItem = document.querySelector(`.sidebar-menu li[data-panel="${panelId}"]`);
                    if (menuItem) {
                        menuItem.classList.add('active');
                    }
                    
                    // Save the current panel to localStorage for persistence
                    localStorage.setItem('currentAdminPanel', panelId);
                    
                    // Handle specific panel initialization
                    switch (panelId) {
                        case 'dashboard-panel':
                            refreshDashboardData();
                            createActivityChart(true);
                            break;
                        case 'announcements-panel':
                            loadAnnouncements();
                            break;
                        case 'access-logs-panel':
                            loadAccessLogs(1);
                            break;
                        case 'store-panel':
                            loadStoreData(true);
                            break;
                        case 'settings-panel':
                            // Load settings from localStorage or defaults
                            loadSiteSettings();
                            break;
                    }
                    
                    // Log analytics
                    trackActivity('navigate', { panel: panelId });
                    
                    return true;
                } else {
                    console.error("Panel not found:", panelId);
                    showNotification(`Error: Panel "${panelId}" not found!`, 'error');
                    return false;
                }
            } catch (error) {
                console.error("Error switching to panel:", panelId, error);
                showNotification('Error navigating to panel. See console for details.', 'error');
                return false;
            }
        }
        
        // Define panel IDs for direct access
        const panels = [
            'dashboard-panel', 
            'announcements-panel', 
            'store-panel',
            'settings-panel',
            'access-logs-panel'
        ];
        
        // Set up click handlers for each sidebar menu item
        document.querySelectorAll('.sidebar-menu li[data-panel]').forEach(item => {
            const panelId = item.getAttribute('data-panel');
            
            if (panelId && panels.includes(panelId)) {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    switchToPanel(panelId);
                });
            }
        });
        
        // Make the switchToPanel function accessible globally through window
        window.switchPanel = switchToPanel;
        
        // Restore last active panel from localStorage or default to dashboard
        const lastPanel = localStorage.getItem('currentAdminPanel') || 'dashboard-panel';
        setTimeout(() => {
            switchToPanel(lastPanel);
        }, 100);
        
        return switchToPanel;
    }

    // Call this function after login
    function initializeDashboard() {
        console.log("Initializing dashboard");
        
        // Setup direct navigation handlers
        setupMenuNavigation();
        
        // Initialize counters at zero first
        updateDashboardCounter('online-players-count', 0);
        updateDashboardCounter('store-sales-count', 0);
        updateDashboardCounter('new-players-count', 0);
        
        // Set up real-time listeners for dashboard stats
        setupDashboardRealTimeListeners();
        
        // Initial load of dashboard components
        refreshDashboardData();
        createActivityChart();
    }
    
    // Initialize counters for logs
    function updateLogCounters() {
        rtDb.ref('logCounters').on('value', (snapshot) => {
            const counters = snapshot.val() || {};
            
            // Update total logs counter
            const totalLogsElement = document.getElementById('total-logs-count');
            if (totalLogsElement) {
                totalLogsElement.textContent = counters.total || 0;
            }
            
            // Update failed logs counter
            const failedLogsElement = document.getElementById('failed-logs-count');
            if (failedLogsElement) {
                failedLogsElement.textContent = counters.failed || 0;
            }
            
            // Update today's logs counter
            const todayLogsElement = document.getElementById('today-logs-count');
            if (todayLogsElement) {
                const today = new Date().toISOString().split('T')[0];
                todayLogsElement.textContent = counters[today] || 0;
            }
        });
    }
    
    // Initialize realtime updates
    function initializeRealTimeUpdates() {
        // Set up handlers for modals
        if (deleteModal) {
            const closeModalBtn = deleteModal.querySelector('.close-modal');
            const cancelDeleteBtn = document.getElementById('cancel-delete');
            
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    deleteModal.classList.remove('show');
                });
            }
            
            if (cancelDeleteBtn) {
                cancelDeleteBtn.addEventListener('click', () => {
                    deleteModal.classList.remove('show');
                });
            }
        }
        
        // Initialize counters
        updateLogCounters();
        
        // Set up search functionality for logs
        const logsSearch = document.getElementById('logs-search');
        const logsFilter = document.getElementById('logs-filter');
        
        if (logsSearch) {
            logsSearch.addEventListener('input', () => {
                loadAccessLogs();
            });
        }
        
        if (logsFilter) {
            logsFilter.addEventListener('change', () => {
                loadAccessLogs();
            });
        }
        
        // Set up refresh buttons
        const refreshActivity = document.getElementById('refresh-activity');
        if (refreshActivity) {
            refreshActivity.addEventListener('click', async () => {
                await trackActivity('refresh', { component: 'activity-chart' });
                createActivityChart(true);
            });
        }
        
        const refreshTransactions = document.getElementById('refresh-transactions');
        if (refreshTransactions) {
            refreshTransactions.addEventListener('click', async () => {
                await trackActivity('refresh', { component: 'transactions' });
                loadStoreData(true);
            });
        }
        
        // Time range for activity chart
        const timeRange = document.getElementById('activity-time-range');
        if (timeRange) {
            timeRange.addEventListener('change', () => {
                createActivityChart();
            });
        }
        
        // Set up pagination for logs
        const prevPageBtn = document.getElementById('logs-prev-page');
        const nextPageBtn = document.getElementById('logs-next-page');
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                const currentPage = parseInt(prevPageBtn.getAttribute('data-current-page') || '1');
                if (currentPage > 1) {
                    loadAccessLogs(currentPage - 1);
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const currentPage = parseInt(nextPageBtn.getAttribute('data-current-page') || '1');
                const totalPages = parseInt(nextPageBtn.getAttribute('data-total-pages') || '1');
                if (currentPage < totalPages) {
                    loadAccessLogs(currentPage + 1);
                }
            });
        }
    }
    
    // Load access logs with improved error handling and localStorage fallback
    async function loadAccessLogs() {
        const accessLogsContainer = document.getElementById('access-logs-list');
        if (!accessLogsContainer) return;
        
        // Show loading indicator
        accessLogsContainer.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading access logs...</p>
            </div>
        `;
        
        try {
            let logs = [];
            
            // Try to get from Firebase if available
            if (firebaseInitialized) {
                try {
                    const snapshot = await db.collection('accessLogs')
                        .orderBy('timestamp', 'desc')
                        .limit(100)
                        .get();
                    
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            logs.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        });
                    }
                } catch (firebaseError) {
                    console.error("Error loading access logs from Firebase:", firebaseError);
                    // Fall back to localStorage
                    logs = JSON.parse(localStorage.getItem('accessLogs') || '[]');
                }
            } else {
                // Firebase not available, use localStorage
                logs = JSON.parse(localStorage.getItem('accessLogs') || '[]');
            }
            
            // Sort logs by timestamp (newest first)
            logs.sort((a, b) => {
                const timestampA = a.timestamp ? new Date(a.timestamp) : new Date(0);
                const timestampB = b.timestamp ? new Date(b.timestamp) : new Date(0);
                return timestampB - timestampA;
            });
            
            // Render logs
            if (logs.length === 0) {
                accessLogsContainer.innerHTML = `
                    <div class="logs-placeholder">
                        <i class="fas fa-history"></i>
                        <p>No access logs available.</p>
                    </div>
                `;
            } else {
                accessLogsContainer.innerHTML = '';
                
                // Create a table for better structure
                const table = document.createElement('table');
                table.className = 'logs-table';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                
                const tbody = table.querySelector('tbody');
                
                logs.forEach(log => {
                    const date = new Date(log.timestamp).toLocaleDateString();
                    const time = new Date(log.timestamp).toLocaleTimeString();
                    
                    const row = document.createElement('tr');
                    row.className = `log-item ${log.type || ''}`;
                    
                    row.innerHTML = `
                        <td>${date} ${time}</td>
                        <td>${log.username || 'Anonymous'}</td>
                        <td>${log.action || 'Unknown'}</td>
                        <td>${formatLogDetails(log.details) || '-'}</td>
                        <td>${log.ip || '-'}</td>
                    `;
                    
                    tbody.appendChild(row);
                });
                
                accessLogsContainer.appendChild(table);
                
                // Add download button
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'download-logs-btn';
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Logs';
                downloadBtn.addEventListener('click', () => downloadLogs(logs));
                
                accessLogsContainer.appendChild(downloadBtn);
            }
        } catch (error) {
            console.error("Error loading access logs:", error);
            accessLogsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading access logs. Please try again.</p>
                </div>
            `;
            
            showNotification("Failed to load access logs. Please try again.", "error");
        }
    }
    
    // Format log details for display
    function formatLogDetails(details) {
        if (!details) return '-';
        
        try {
            if (typeof details === 'string') {
                // Try to parse if it's a JSON string
                try {
                    details = JSON.parse(details);
                } catch (e) {
                    // Not valid JSON, return as is
                    return details;
                }
            }
            
            // Format object to readable string
            return Object.entries(details)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
        } catch (error) {
            console.error("Error formatting log details:", error);
            return String(details);
        }
    }
    
    // Download logs as CSV
    function downloadLogs(logs) {
        try {
            // Format logs into CSV
            const headers = ['Date', 'Time', 'User', 'Action', 'Details', 'IP'];
            
            const rows = logs.map(log => {
                const date = new Date(log.timestamp);
                return [
                    date.toLocaleDateString(),
                    date.toLocaleTimeString(),
                    log.username || 'Anonymous',
                    log.action || 'Unknown',
                    typeof log.details === 'object' ? 
                        JSON.stringify(log.details).replace(/"/g, '""') : 
                        (log.details || '-'),
                    log.ip || '-'
                ];
            });
            
            // Combine headers and rows
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');
            
            // Create a download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.setAttribute('href', url);
            link.setAttribute('download', `melonmc_access_logs_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification("Logs downloaded successfully!", "success");
        } catch (error) {
            console.error("Error downloading logs:", error);
            showNotification("Error downloading logs. Please try again.", "error");
        }
    }
    
    // Improved announcements loading with local storage fallback
    async function loadAnnouncements() {
        const announcementsList = document.getElementById('announcements-list');
        if (!announcementsList) return;
        
        // Show loading indicator
        announcementsList.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading announcements...</p>
            </div>
        `;
        
        try {
            let announcements = [];
            
            // Try to get from Firebase if available
            if (firebaseInitialized) {
                try {
                    const snapshot = await db.collection('announcements')
                        .orderBy('createdAt', 'desc')
                        .get();
                    
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            announcements.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        });
                    }
                } catch (firebaseError) {
                    console.error("Error loading announcements from Firebase:", firebaseError);
                    // Fall back to localStorage
                    announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
                }
            } else {
                // Firebase not available, use localStorage
                announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
            }
            
            // Render announcements
            if (announcements.length === 0) {
                announcementsList.innerHTML = `
                    <div class="announcement-placeholder">
                        <i class="fas fa-bullhorn"></i>
                        <p>No announcements yet. Create your first announcement!</p>
                    </div>
                `;
            } else {
                announcementsList.innerHTML = '';
                
                announcements.forEach(announcement => {
                    const date = new Date(announcement.createdAt || announcement.timestamp || Date.now()).toLocaleDateString();
                    const time = new Date(announcement.createdAt || announcement.timestamp || Date.now()).toLocaleTimeString();
                    
                    const announcementElement = document.createElement('div');
                    announcementElement.className = 'announcement-item';
                    announcementElement.setAttribute('data-id', announcement.id);
                    
                    announcementElement.innerHTML = `
                        <div class="announcement-type ${announcement.type || 'update'}">${announcement.type || 'update'}</div>
                        <div class="announcement-content">
                            <h3>${announcement.title || 'Untitled Announcement'}</h3>
                            <p>${announcement.content || ''}</p>
                            <div class="announcement-meta">
                                <span>Posted on ${date} at ${time}</span>
                            </div>
                        </div>
                        <div class="announcement-actions">
                            <button class="edit-btn" data-id="${announcement.id}"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" data-id="${announcement.id}"><i class="fas fa-trash"></i></button>
                        </div>
                        <div class="delete-overlay">
                            <div class="spinner"></div>
                            <p>Deleting...</p>
                        </div>
                    `;
                    
                    announcementsList.appendChild(announcementElement);
                    
                    // Add event listeners for edit and delete buttons
                    const editBtn = announcementElement.querySelector('.edit-btn');
                    const deleteBtn = announcementElement.querySelector('.delete-btn');
                    
                    if (editBtn) {
                        editBtn.addEventListener('click', () => {
                            editAnnouncement(announcement);
                        });
                    }
                    
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', () => {
                            showDeleteConfirmation(announcement.id, 'announcement');
                        });
                    }
                });
            }
            
            // Set up the "Add New" button
            const addAnnouncementBtn = document.getElementById('add-announcement-btn');
            const announcementEditor = document.getElementById('announcement-editor');
            const cancelAnnouncementBtn = document.getElementById('cancel-announcement');
            const announcementForm = document.getElementById('announcement-form');
            
            if (addAnnouncementBtn && announcementEditor && cancelAnnouncementBtn && announcementForm) {
                // Remove existing event listeners
                addAnnouncementBtn.removeEventListener('click', showAnnouncementEditor);
                cancelAnnouncementBtn.removeEventListener('click', hideAnnouncementEditor);
                announcementForm.removeEventListener('submit', handleAnnouncementSubmit);
                
                // Add new event listeners
                addAnnouncementBtn.addEventListener('click', showAnnouncementEditor);
                cancelAnnouncementBtn.addEventListener('click', hideAnnouncementEditor);
                announcementForm.addEventListener('submit', handleAnnouncementSubmit);
            }
        } catch (error) {
            console.error("Error in loadAnnouncements:", error);
            announcementsList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading announcements. Please try again.</p>
                </div>
            `;
            
            showNotification("Failed to load announcements. Please try again.", "error");
        }
    }
    
    // Helper functions for announcements
    function showAnnouncementEditor() {
        const editor = document.getElementById('announcement-editor');
        if (editor) {
            editor.style.display = 'block';
            
            // Clear form fields for new announcement
            document.getElementById('announcement-title').value = '';
            document.getElementById('announcement-content').value = '';
            document.getElementById('announcement-type').value = 'update';
            
            // Remove any edit ID
            editor.removeAttribute('data-edit-id');
            
            // Update title
            const editorTitle = editor.querySelector('h3');
            if (editorTitle) {
                editorTitle.textContent = 'Create Announcement';
            }
        }
    }
    
    function hideAnnouncementEditor() {
        const editor = document.getElementById('announcement-editor');
        if (editor) {
            editor.style.display = 'none';
        }
    }
    
    function editAnnouncement(announcement) {
        const editor = document.getElementById('announcement-editor');
        if (!editor) return;
        
        // Display the editor
        editor.style.display = 'block';
        
        // Set edit ID
        editor.setAttribute('data-edit-id', announcement.id);
        
        // Fill in form fields
        document.getElementById('announcement-title').value = announcement.title || '';
        document.getElementById('announcement-content').value = announcement.content || '';
        document.getElementById('announcement-type').value = announcement.type || 'update';
        
        // Update title
        const editorTitle = editor.querySelector('h3');
        if (editorTitle) {
            editorTitle.textContent = 'Edit Announcement';
        }
    }
    
    async function handleAnnouncementSubmit(e) {
        e.preventDefault();
        
        try {
            const title = document.getElementById('announcement-title').value.trim();
            const content = document.getElementById('announcement-content').value.trim();
            const type = document.getElementById('announcement-type').value;
            
            // Validate input
            if (!title || !content) {
                showNotification("Please fill out all required fields", "warning");
                return;
            }
            
            // Show loading state
            const submitButton = e.target.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            const editor = document.getElementById('announcement-editor');
            const editId = editor.getAttribute('data-edit-id');
            
            let success = false;
            
            try {
                if (editId) {
                    // Update existing announcement
                    await updateAnnouncement(editId, { title, content, type });
                    success = true;
                } else {
                    // Create new announcement
                    await createAnnouncement(title, content, type);
                    success = true;
                }
                
                // Hide editor and reload announcements if successful
                if (success) {
                    hideAnnouncementEditor();
                    loadAnnouncements();
                }
            } catch (error) {
                console.error("Error handling announcement submission:", error);
                showNotification("Error saving announcement. Please try again.", "error");
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        } catch (error) {
            console.error("Error in form submission handler:", error);
            showNotification("An unexpected error occurred. Please try again.", "error");
        }
    }
    
    // Create a new announcement with improved error handling
    async function createAnnouncement(title, content, type = 'update') {
        try {
            // Generate a unique ID
            const id = 'announcement_' + Date.now();
            const timestamp = new Date().toISOString();
            
            // Create announcement object
            const newAnnouncement = {
                id,
                title,
                content,
                type,
                timestamp,
                createdBy: localStorage.getItem('adminUsername') || 'admin'
            };
            
            // Try to save to Firebase if available
            let success = false;
            
            if (firebaseInitialized) {
                try {
                    // Add createdAt for Firestore
                    const firestoreAnnouncement = {
                        ...newAnnouncement,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // Save to Firestore
                    await db.collection('announcements').doc(id).set(firestoreAnnouncement);
                    success = true;
                    console.log("Announcement saved to Firebase successfully");
                } catch (firebaseError) {
                    console.error("Error saving announcement to Firebase:", firebaseError);
                }
            }
            
            // Always save to localStorage as backup
            try {
                const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
                announcements.unshift(newAnnouncement);
                localStorage.setItem('announcements', JSON.stringify(announcements));
                console.log("Announcement saved to localStorage successfully");
                
                if (!success) {
                    success = true; // Mark as success if saved to localStorage
                }
            } catch (localStorageError) {
                console.error("Error saving to localStorage:", localStorageError);
                if (!success) {
                    showNotification("Failed to save announcement. Please try again.", "error");
                    throw new Error("Failed to save announcement to both Firebase and localStorage");
                }
            }
            
            // Log the activity
            try {
                await trackActivity('create_announcement', { title, type });
            } catch (activityError) {
                console.warn("Could not track activity:", activityError);
            }
            
            // Show success notification
            showNotification(
                success ? (firebaseInitialized ? "Announcement created and synced!" : "Announcement saved locally.") : "Failed to save announcement.", 
                success ? (firebaseInitialized ? "success" : "warning") : "error"
            );
            
            return id;
        } catch (error) {
            console.error("Error creating announcement:", error);
            showNotification("Failed to create announcement. Please try again.", "error");
            throw error;
        }
    }
    
    // Update an existing announcement
    async function updateAnnouncement(id, { title, content, type }) {
        try {
            // Get the timestamp
            const timestamp = new Date().toISOString();
            
            // Update object
            const updateData = {
                title,
                content,
                type,
                updatedAt: timestamp,
                updatedBy: localStorage.getItem('adminUsername') || 'admin'
            };
            
            // Try to update in Firebase if available
            let success = false;
            
            if (firebaseInitialized) {
                try {
                    // Add Firestore timestamp
                    const firestoreUpdateData = {
                        ...updateData,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // Update in Firestore
                    await db.collection('announcements').doc(id).update(firestoreUpdateData);
                    success = true;
                    console.log("Announcement updated in Firebase successfully");
                } catch (firebaseError) {
                    console.error("Error updating announcement in Firebase:", firebaseError);
                }
            }
            
            // Always update in localStorage
            try {
                const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
                const index = announcements.findIndex(a => a.id === id);
                
                if (index !== -1) {
                    announcements[index] = {
                        ...announcements[index],
                        ...updateData
                    };
                    localStorage.setItem('announcements', JSON.stringify(announcements));
                    console.log("Announcement updated in localStorage successfully");
                    
                    if (!success) {
                        success = true; // Mark as success if saved to localStorage
                    }
                }
            } catch (localStorageError) {
                console.error("Error updating in localStorage:", localStorageError);
                if (!success) {
                    showNotification("Failed to update announcement. Please try again.", "error");
                    throw new Error("Failed to update announcement in both Firebase and localStorage");
                }
            }
            
            // Log the activity
            try {
                await trackActivity('update_announcement', { id, title, type });
            } catch (activityError) {
                console.warn("Could not track activity:", activityError);
            }
            
            // Show success notification
            showNotification(
                success ? (firebaseInitialized ? "Announcement updated and synced!" : "Announcement updated locally.") : "Failed to update announcement.", 
                success ? (firebaseInitialized ? "success" : "warning") : "error"
            );
            
            return id;
        } catch (error) {
            console.error("Error updating announcement:", error);
            showNotification("Failed to update announcement. Please try again.", "error");
            throw error;
        }
    }
    
    // Delete an announcement with improved error handling
    async function deleteAnnouncement(announcementId) {
        try {
            const announcementElement = document.querySelector(`.announcement-item[data-id="${announcementId}"]`);
            
            if (announcementElement) {
                // Add deleting class for animation
                announcementElement.classList.add('deleting');
            }
            
            // Try to delete from Firebase if available
            let success = false;
            
            if (firebaseInitialized) {
                try {
                    // Delete from Firestore
                    await db.collection('announcements').doc(announcementId).delete();
                    success = true;
                    console.log("Announcement deleted from Firebase successfully");
                } catch (firebaseError) {
                    console.error("Error deleting announcement from Firebase:", firebaseError);
                }
            }
            
            // Always update localStorage
            try {
                const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
                const updatedAnnouncements = announcements.filter(a => a.id !== announcementId);
                localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
                console.log("Announcement deleted from localStorage successfully");
                
                if (!success) {
                    success = true; // Mark as success if removed from localStorage
                }
            } catch (localStorageError) {
                console.error("Error updating localStorage:", localStorageError);
                if (!success) {
                    showNotification("Failed to delete announcement. Please try again.", "error");
                    throw new Error("Failed to delete announcement from both Firebase and localStorage");
                }
            }
            
            // Log the activity
            try {
                await trackActivity('delete_announcement', { id: announcementId });
            } catch (activityError) {
                console.warn("Could not track activity:", activityError);
            }
            
            // Wait a bit for the animation to complete
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Remove the element from the DOM
            if (announcementElement) {
                announcementElement.remove();
            }
            
            // Show success notification
            showNotification(
                success ? (firebaseInitialized ? "Announcement deleted and synced!" : "Announcement deleted locally.") : "Failed to delete announcement.", 
                success ? (firebaseInitialized ? "success" : "warning") : "error"
            );
            
            // Check if announcements list is now empty and show placeholder if needed
            const announcementsList = document.getElementById('announcements-list');
            if (announcementsList && !announcementsList.querySelector('.announcement-item')) {
                announcementsList.innerHTML = `
                    <div class="announcement-placeholder">
                        <i class="fas fa-bullhorn"></i>
                        <p>No announcements yet. Create your first announcement!</p>
                    </div>
                `;
            }
            
            return true;
        } catch (error) {
            console.error("Error deleting announcement:", error);
            showNotification("Failed to delete announcement. Please try again.", "error");
            throw error;
        }
    }
    
    // Function to show delete confirmation
    function showDeleteConfirmation(itemId, itemType = 'item') {
        const modal = document.getElementById('delete-confirmation-modal');
        const confirmBtn = document.getElementById('confirm-delete');
        const cancelBtn = document.getElementById('cancel-delete');
        const closeBtn = modal.querySelector('.close-modal');
        
        if (modal && confirmBtn && cancelBtn) {
            // Show the modal
            modal.style.display = 'block';
            modal.classList.add('show');
            
            // Set data attributes
            modal.setAttribute('data-item-id', itemId);
            modal.setAttribute('data-item-type', itemType);
            
            // Update modal text
            const modalBody = modal.querySelector('.modal-body p');
            if (modalBody) {
                modalBody.textContent = `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;
            }
            
            // Remove existing event listeners to prevent duplicates
            confirmBtn.removeEventListener('click', handleDeleteConfirmation);
            cancelBtn.removeEventListener('click', hideDeleteConfirmation);
            if (closeBtn) closeBtn.removeEventListener('click', hideDeleteConfirmation);
            
            // Add new event listeners
            confirmBtn.addEventListener('click', handleDeleteConfirmation);
            cancelBtn.addEventListener('click', hideDeleteConfirmation);
            if (closeBtn) closeBtn.addEventListener('click', hideDeleteConfirmation);
        }
    }
    
    // Handle delete confirmation
    async function handleDeleteConfirmation() {
        const modal = document.getElementById('delete-confirmation-modal');
        const itemId = modal.getAttribute('data-item-id');
        const itemType = modal.getAttribute('data-item-type');
        
        if (itemId) {
            hideDeleteConfirmation();
            
            try {
                if (itemType === 'announcement') {
                    await deleteAnnouncement(itemId);
                } 
                // Add other item types here as needed
            } catch (error) {
                console.error(`Error deleting ${itemType}:`, error);
                showNotification(`Failed to delete ${itemType}. Please try again.`, "error");
            }
        }
    }
    
    // Hide delete confirmation
    function hideDeleteConfirmation() {
        const modal = document.getElementById('delete-confirmation-modal');
        if (modal) {
            modal.classList.remove('show');
            
            // Wait for animation to complete
            setTimeout(() => {
                modal.style.display = 'none';
                
                // Clear data attributes
                modal.removeAttribute('data-item-id');
                modal.removeAttribute('data-item-type');
            }, 300);
        }
    }
    
    // Store data management
    async function loadStoreData(forceRefresh = false) {
        const transactionsContainer = document.getElementById('transactions-list');
        const transactionsLoader = document.getElementById('transactions-loading');
        
        if (!transactionsContainer) return;
        
        // Show loader
        if (transactionsLoader) {
            transactionsLoader.style.display = 'block';
        }
        
        try {
            // Get transactions from Firestore
            const snapshot = await db.collection('transactions')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();
            
            // Clear container
            transactionsContainer.innerHTML = '';
            
            if (snapshot.empty) {
                transactionsContainer.innerHTML = '<div class="no-data">No recent transactions</div>';
            } else {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const transactionDate = new Date(data.timestamp?.toDate() || data.timestamp || Date.now());
                    
                    // Create transaction element
                    const transactionElement = document.createElement('div');
                    transactionElement.className = 'transaction-item';
                    transactionElement.setAttribute('data-id', doc.id);
                    
                    // Apply new transaction highlight effect if forced refresh
                    if (forceRefresh) {
                        transactionElement.classList.add('new-transaction');
                        setTimeout(() => {
                            transactionElement.classList.remove('new-transaction');
                        }, 3000);
                    }
                    
                    const transactionContent = `
                        <div class="transaction-header">
                            <span class="transaction-product">${data.product || 'Unknown Product'}</span>
                            <span class="transaction-amount">$${data.amount?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div class="transaction-details">
                            <span class="transaction-username">${data.username || 'Anonymous'}</span>
                            <span class="transaction-date">${transactionDate.toLocaleString()}</span>
                        </div>
                    `;
                    
                    transactionElement.innerHTML = transactionContent;
                    transactionsContainer.appendChild(transactionElement);
                });
            }
        } catch (error) {
            console.error("Error loading transactions:", error);
            transactionsContainer.innerHTML = '<div class="error">Error loading transactions</div>';
        } finally {
            // Hide loader
            if (transactionsLoader) {
                transactionsLoader.style.display = 'none';
            }
        }
    }
    
    // Dashboard data
    function setupDashboardRealTimeListeners() {
        // Online players counter
        rtDb.ref('stats/onlinePlayers').on('value', (snapshot) => {
            const count = snapshot.val() || 0;
            updateDashboardCounter('online-players-count', count, true);
        });
        
        // Store sales counter
        rtDb.ref('stats/storeSales').on('value', (snapshot) => {
            const data = snapshot.val() || {};
            const count = data.today || 0;
            updateDashboardCounter('store-sales-count', count, true);
        });
        
        // New players counter
        rtDb.ref('stats/newPlayers').on('value', (snapshot) => {
            const data = snapshot.val() || {};
            const count = data.today || 0;
            updateDashboardCounter('new-players-count', count, true);
        });
        
        // Real-time activity feed
        rtDb.ref('activityLogs').orderByChild('timestamp').limitToLast(10).on('child_added', (snapshot) => {
            updateActivityFeed(snapshot.val());
        });
    }
    
    // Update dashboard counter with animation
    function updateDashboardCounter(id, value, animate = false) {
        const element = document.getElementById(id);
        if (!element) return;
        
        if (animate) {
            element.classList.add('pulse-update');
            setTimeout(() => {
                element.classList.remove('pulse-update');
            }, 2000);
        }
        
        element.textContent = value;
    }
    
    // Refresh dashboard data
    function refreshDashboardData() {
        // Nothing to do here as we've set up real-time listeners
        // But we can manually force refresh if needed
        
        // Update timestamp
        const lastUpdateElement = document.getElementById('last-updated');
        if (lastUpdateElement) {
            const now = new Date();
            lastUpdateElement.textContent = now.toLocaleTimeString();
        }
    }
    
    // Update activity feed with new entry
    function updateActivityFeed(data) {
        const activityFeed = document.getElementById('activity-feed');
        if (!activityFeed) return;
        
        // Create new activity element
        const activityElement = document.createElement('div');
        activityElement.className = `activity-item ${data.status} ${data.action}`;
        
        const timestamp = new Date(data.timestamp);
        const formattedTime = timestamp.toLocaleTimeString();
        
        const activityContent = `
            <div class="activity-time">${formattedTime}</div>
            <div class="activity-user">${data.username}</div>
            <div class="activity-action">${data.action}</div>
        `;
        
        activityElement.innerHTML = activityContent;
        
        // Add the new activity at the top
        if (activityFeed.firstChild) {
            activityFeed.insertBefore(activityElement, activityFeed.firstChild);
        } else {
            activityFeed.appendChild(activityElement);
        }
        
        // Limit to 10 items
        while (activityFeed.children.length > 10) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
        
        // Highlight new activity
        activityElement.classList.add('new-activity');
        setTimeout(() => {
            activityElement.classList.remove('new-activity');
        }, 3000);
    }
    
    // Create activity chart
    function createActivityChart(forceRefresh = false) {
        const chartContainer = document.getElementById('activity-chart');
        const timeRange = document.getElementById('activity-time-range');
        
        if (!chartContainer) return;
        
        // Get time range selection
        const range = timeRange ? timeRange.value : '24h';
        
        // Show loading
        chartContainer.innerHTML = '<div class="loading">Loading chart data...</div>';
        
        // Get data from Firestore
        let startTime;
        const now = new Date();
        
        switch (range) {
            case '24h':
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        
        // Convert to timestamp for Firestore
        const startTimestamp = firebase.firestore.Timestamp.fromDate(startTime);
        
        db.collection('activityLogs')
            .where('createdAt', '>=', startTimestamp)
            .orderBy('createdAt', 'asc')
            .get()
            .then((snapshot) => {
                if (snapshot.empty) {
                    chartContainer.innerHTML = '<div class="no-data">No activity data available</div>';
                    return;
                }
                
                // Process data for chart
                const activityData = [];
                snapshot.forEach(doc => {
                    activityData.push(doc.data());
                });
                
                // Generate the chart (simple representation)
                chartContainer.innerHTML = '';
                
                // Group data by hour or day depending on range
                const groupedData = {};
                const format = range === '24h' ? 'hour' : 'day';
                
                activityData.forEach(item => {
                    const date = item.createdAt?.toDate() || new Date(item.timestamp);
                    let key;
                    
                    if (format === 'hour') {
                        key = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
                    } else {
                        key = `${date.getMonth() + 1}/${date.getDate()}`;
                    }
                    
                    if (!groupedData[key]) {
                        groupedData[key] = 0;
                    }
                    
                    groupedData[key]++;
                });
                
                // Create simple bar chart
                const chartElement = document.createElement('div');
                chartElement.className = 'simple-chart';
                
                // Find max value for scaling
                const maxValue = Math.max(...Object.values(groupedData), 1);
                
                // Create bars
                Object.entries(groupedData).forEach(([label, value]) => {
                    const percentage = (value / maxValue) * 100;
                    
                    const barElement = document.createElement('div');
                    barElement.className = 'chart-bar';
                    
                    barElement.innerHTML = `
                        <div class="bar-label">${label}</div>
                        <div class="bar-container">
                            <div class="bar" style="height: ${percentage}%"></div>
                        </div>
                        <div class="bar-value">${value}</div>
                    `;
                    
                    chartElement.appendChild(barElement);
                });
                
                chartContainer.appendChild(chartElement);
            })
            .catch((error) => {
                console.error("Error getting activity data:", error);
                chartContainer.innerHTML = '<div class="error">Error loading chart data</div>';
            });
    }
    
    // Enhanced notification system
    function showNotification(message, type = 'info', showOnLogin = false) {
        try {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            
            // Add to document
            document.body.appendChild(notification);
            
            // Force visibility on login page if specified
            if (showOnLogin) {
                notification.style.zIndex = "9999";
            }
            
            // Show with animation
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Auto-remove after delay
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 500);
            }, 5000);
        } catch (error) {
            console.error("Error showing notification:", error);
        }
    }
    
    // Load website settings
    function loadSiteSettings() {
        try {
            // Try to load settings from localStorage
            const savedSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
            
            // Site name
            const siteNameField = document.getElementById('site-name');
            if (siteNameField) {
                siteNameField.value = savedSettings.siteName || 'MelonMC Network';
            }
            
            // Server IP
            const serverIpField = document.getElementById('server-ip');
            if (serverIpField) {
                serverIpField.value = savedSettings.serverIp || 'play.melon-mc.fun:19141';
            }
            
            // Primary color
            const primaryColorField = document.getElementById('primary-color');
            if (primaryColorField) {
                primaryColorField.value = savedSettings.primaryColor || '#4158D0';
            }
            
            // Secondary color
            const secondaryColorField = document.getElementById('secondary-color');
            if (secondaryColorField) {
                secondaryColorField.value = savedSettings.secondaryColor || '#C850C0';
            }
            
            // Set up form submission handler
            const settingsForm = document.getElementById('settings-form');
            if (settingsForm) {
                settingsForm.removeEventListener('submit', handleSettingsSubmit);
                settingsForm.addEventListener('submit', handleSettingsSubmit);
            }
        } catch (error) {
            console.error("Error loading site settings:", error);
            showNotification("Error loading settings. Using defaults instead.", "warning");
        }
    }
    
    // Handle settings form submission
    async function handleSettingsSubmit(e) {
        e.preventDefault();
        
        try {
            const siteName = document.getElementById('site-name').value;
            const serverIp = document.getElementById('server-ip').value;
            const primaryColor = document.getElementById('primary-color').value;
            const secondaryColor = document.getElementById('secondary-color').value;
            
            // Save to localStorage
            const settings = {
                siteName,
                serverIp,
                primaryColor,
                secondaryColor,
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem('siteSettings', JSON.stringify(settings));
            
            // Try to save to Firebase if available
            if (firebaseInitialized) {
                try {
                    await db.collection('siteSettings').doc('main').set(settings, { merge: true });
                } catch (firebaseError) {
                    console.warn("Could not save settings to Firebase:", firebaseError);
                }
            }
            
            showNotification("Settings saved successfully!", "success");
            
            // Log the event
            trackActivity('update_settings', { settings });
        } catch (error) {
            console.error("Error saving settings:", error);
            showNotification("Error saving settings. Please try again.", "error");
        }
    }

    // Check Firebase connection status
    async function checkFirebaseConnection() {
        console.log("Checking Firebase connection status...");
        
        if (!firebaseInitialized) {
            console.warn("Firebase is not initialized, running in offline mode");
            showNotification("Running in offline mode. Announcements will be saved locally.", "warning");
            return false;
        }
        
        try {
            // Test Firestore connection
            if (db) {
                // Try to access a collection
                await db.collection('connectionTest').doc('test').set({
                    timestamp: new Date().toISOString(),
                    test: true
                });
                console.log("Firebase Firestore connection successful");
                return true;
            } else {
                console.warn("Firestore is not available");
                showNotification("Database connection issue. Announcements will be saved locally.", "warning");
                return false;
            }
        } catch (error) {
            console.error("Firebase connection test failed:", error);
            showNotification("Database connection failed. Announcements will be saved locally.", "warning");
            return false;
        }
    }

    // Call this function on page load after small delay
    setTimeout(() => {
        checkFirebaseConnection().then(isConnected => {
            console.log("Firebase connection status:", isConnected ? "Connected" : "Disconnected");
        });
    }, 2000);
});

// Handle page navigation
function handleHashChange() {
    const currentHash = window.location.hash || '#';
    console.log('Hash changed to:', currentHash);
    
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the appropriate section based on the hash
    if (currentHash === '#dashboard') {
        // Check if logged in
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const username = localStorage.getItem('adminUsername');
        
        if (isLoggedIn && username === 'Biltubhaiandharshbhaiophai123') {
            console.log('Loading dashboard for logged in user:', username);
            
            // Hide login, show dashboard
            const loginSection = document.getElementById('login-section');
            const dashboardSection = document.getElementById('dashboard-section');
            
            if (loginSection) {
                loginSection.style.display = 'none';
            }
            if (dashboardSection) {
                dashboardSection.style.display = 'flex';
                
                // Update the displayed name
                const loggedUserDisplay = document.getElementById('logged-user-display');
                if (loggedUserDisplay) {
                    loggedUserDisplay.textContent = username;
                    loggedUserDisplay.classList.add('live-indicator');
                }
                
                // Initialize dashboard functions
                if (typeof initializeDashboard === 'function') {
                    initializeDashboard();
                }
                if (typeof loadAccessLogs === 'function') {
                    loadAccessLogs();
                }
                if (typeof setupMenuNavigation === 'function') {
                    setupMenuNavigation();
                }
                
                console.log('Dashboard fully initialized');
            }
        } else {
            console.log('User not logged in, redirecting to login');
            window.location.hash = '#';
        }
    } else {
        // Default to login page
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
            loginSection.style.display = 'flex';
        }
    }
}

// Listen for hash changes
window.addEventListener('hashchange', handleHashChange);

// Auto-redirect if already logged in on login page
if (window.location.hash === '' || window.location.hash === '#') {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    const adminUsername = localStorage.getItem('adminUsername');
    
    if (adminLoggedIn === 'true' && adminUsername === 'Biltubhaiandharshbhaiophai123') {
        console.log('Admin already logged in, redirecting to dashboard');
        window.location.hash = '#dashboard';
    }
} 