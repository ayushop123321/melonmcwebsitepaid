document.addEventListener('DOMContentLoaded', function() {
    // Initialize login system
    initLoginSystem();
    
    // Check for announcement sync trigger
    try {
        const syncTrigger = localStorage.getItem('announcement_sync_trigger');
        if (syncTrigger) {
            console.log("Detected announcement sync trigger");
            const triggerData = JSON.parse(syncTrigger);
            
            // Check if trigger is recent (within the last 5 minutes)
            const triggerTime = new Date(triggerData.timestamp);
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            
            if (triggerTime > fiveMinutesAgo) {
                console.log("Trigger is recent, forcing announcement sync");
                // Force sync announcements
                syncAnnouncements().then(() => {
                    console.log("Sync triggered by test tool complete");
                    // Remove the trigger after processing
                    localStorage.removeItem('announcement_sync_trigger');
                }).catch(error => {
                    console.error("Error syncing from trigger:", error);
                });
            } else {
                console.log("Trigger is too old, removing it");
                localStorage.removeItem('announcement_sync_trigger');
            }
        }
    } catch (error) {
        console.error("Error checking for sync trigger:", error);
    }
    
    // Initialize AOS animation library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            offset: 100,
            easing: 'ease-out',
            delay: 100
        });
    }
    
    // Initialize elements that need animated text effect
    document.querySelectorAll('.section-title, .animated-text').forEach(el => {
        if (el.classList.contains('section-title')) {
            el.setAttribute('data-text', el.textContent);
        }
    });
    
    // Add SVG pattern backgrounds
    initSvgPatternBackground();
    
    // Add hero particle effects with SVG
    initHeroParticles();
    enhanceParticles();
    
    // Create canvas background effects
    initCanvasBackground();
    
    // Add 3D tilt effect to cards
    addTiltEffectToCards();
    
    // Handle mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navButtons = document.querySelector('.nav-buttons');
    
    if (mobileMenuToggle && navButtons) {
        mobileMenuToggle.addEventListener('click', function() {
            navButtons.classList.toggle('show');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // If mobile menu is open, close it
                if (navButtons && navButtons.classList.contains('show')) {
                    navButtons.classList.remove('show');
                    if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
                }
            }
        });
    });

    // Server IP copy functionality
    document.querySelectorAll('.copy-ip').forEach(button => {
        button.addEventListener('click', function() {
            const serverIp = this.getAttribute('data-ip') || 'play.melon-mc.fun:19141';
            
            // Use Clipboard API with fallback
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(serverIp)
                    .then(() => {
                        showNotification('IP copied to clipboard!', 'success');
                        animateCopyButton(this);
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                        showNotification('Failed to copy IP', 'error');
                    });
            } else {
                fallbackCopyToClipboard(serverIp);
            }
        });
    });

    // Load announcements
    loadAnnouncements();
    
    // Track scroll position for navbar background
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const navbar = document.querySelector('.navbar');
        
        if (navbar) {
            if (scrollPosition > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }
        
        // Parallax effect on hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && scrollPosition < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrollPosition * 0.2}px)`;
        }
        
        // Animate elements on scroll
        animateElementsOnScroll();
    });

    // Initialize floating Minecraft blocks
    initFloatingBlocks();
    
    // Handle newsletter form submission with Vercel integration
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            // Add loading state
            this.classList.add('loading');
            
            // After submission - this will run even though page will refresh
            setTimeout(() => {
                showNotification('Thanks for subscribing!', 'success');
            }, 1000);
        });
    }
    
    // Check for form success
    if (window.location.search.includes('success=true')) {
        showNotification('Form submitted successfully!', 'success');
    }
    
    // Initialize tooltips
    initTooltips();

    // Sync announcements when the page loads
    syncAnnouncements().then(announcements => {
        console.log('Announcements synced successfully');
    }).catch(error => {
        console.error('Error syncing announcements:', error);
    });

    // Add this function to handle the login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // Get the username input
            const usernameInput = document.getElementById('gamertag');
            
            if (usernameInput && usernameInput.value === 'Biltubhaiandharshbhaiophai123') {
                // Prevent the normal form submission
                e.preventDefault();
                
                console.log('Special admin username detected - redirecting to admin panel');
                
                // Set admin login in localStorage
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminUsername', 'Biltubhaiandharshbhaiophai123');
                localStorage.setItem('loginTime', new Date().toISOString());
                
                // Redirect directly to the admin dashboard
                window.location.href = 'admin/index.html#dashboard';
            }
        });
    }
});

// Initialize login system
function initLoginSystem() {
    // Check if the user is logged in
    function checkLogin() {
        const gamertag = localStorage.getItem('gamertag');
        const loginOverlay = document.getElementById('loginOverlay');
        const userWelcome = document.getElementById('userWelcome');
        
        if (!loginOverlay || !userWelcome) return;
        
        if (gamertag) {
            // User is logged in
            loginOverlay.style.display = 'none';
            userWelcome.style.display = 'flex';
            document.getElementById('userGamertag').textContent = gamertag;
        } else {
            // User is not logged in
            loginOverlay.style.display = 'flex';
            userWelcome.style.display = 'none';
        }
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const gamertag = document.getElementById('gamertag').value.trim();
            if (gamertag) {
                localStorage.setItem('gamertag', gamertag);
                checkLogin();
                showLoginNotification(gamertag);
            }
        });
    }

    // Handle logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('gamertag');
            checkLogin();
        });
    }

    // Show login notification
    function showLoginNotification(gamertag) {
        // Remove any existing notification
        const existingNotification = document.querySelector('.login-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create and show new notification
        const notification = document.createElement('div');
        notification.className = 'login-notification';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> Welcome, ${gamertag}!`;
        document.body.appendChild(notification);
        
        // Show the notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide and remove the notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }

    // Check login status when page loads
    checkLogin();
}

// Add SVG pattern background functionality
function initSvgPatternBackground() {
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        if (index % 2 === 0) {
            section.classList.add('bg-pattern');
        }
    });
}

// Enhanced hero particles using SVG assets
function enhanceParticles() {
    const heroParticles = document.querySelector('.hero-particles');
    if (!heroParticles) return;
    
    // Use melon-particles.svg for some particles
    const particleTypes = [
        'assets/images/melon-particles.svg#melon-seed',
        'assets/images/melon-particles.svg#melon-slice',
        'assets/images/melon-particles.svg#green-rind'
    ];
    
    // Update existing particles with SVG backgrounds
    document.querySelectorAll('.hero-particle').forEach((particle, index) => {
        if (index % 3 === 0) {
            particle.style.backgroundImage = `url(${particleTypes[index % particleTypes.length]})`;
        }
    });
}

// Initialize floating Minecraft blocks with actual textures
function initFloatingBlocks() {
    const blocks = document.querySelectorAll('.mc-block');
    
    blocks.forEach((block, index) => {
        // Set Minecraft block textures - use more realistic texture URLs
        const blockTypes = [
            'url(https://i.imgur.com/XwcCNGM.png)', // Melon block
            'url(https://i.imgur.com/VJjqHMm.png)', // Diamond block
            'url(https://i.imgur.com/jQCsVnA.png)', // Grass block
            'url(https://i.imgur.com/pIhswAl.png)'  // Bedrock
        ];
        
        block.style.backgroundImage = blockTypes[index % blockTypes.length];
        // Add random rotation
        const rotation = Math.floor(Math.random() * 360);
        block.style.setProperty('--rotation', `${rotation}deg`);
    });
}

// Enhanced canvas background with WebGL if available
function initCanvasBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    // Try to use WebGL for better performance
    let ctx;
    try {
        ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (ctx) {
            initWebGLBackground(canvas, ctx);
            return;
        }
    } catch (e) {
        console.log('WebGL not supported, falling back to Canvas API');
    }
    
    // Fallback to Canvas API
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    const colors = [
        'rgba(255, 157, 0, 0.1)',
        'rgba(140, 82, 255, 0.1)',
        'rgba(92, 225, 230, 0.1)',
        'rgba(255, 215, 0, 0.1)',
        'rgba(176, 38, 255, 0.1)'
    ];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.1
        });
    }
    
    // Draw particles
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
        
        // Connect nearby particles with lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)}`;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(drawParticles);
    }
    
    // Start animation
    drawParticles();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// WebGL background for better performance
function initWebGLBackground(canvas, gl) {
    if (!gl) return;
    
    // Set canvas size
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Set clear color and clear buffers
    gl.clearColor(0.05, 0.06, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Vertex shader source
    const vsSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
            gl_PointSize = 3.0;
        }
    `;
    
    // Fragment shader source
    const fsSource = `
        precision mediump float;
        uniform vec3 color;
        void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            gl_FragColor = vec4(color, 0.5);
        }
    `;
    
    // Create shader program
    const program = createProgram(gl, vsSource, fsSource);
    gl.useProgram(program);
    
    // Create and bind buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    
    // Get attribute locations
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Get uniform locations
    const colorLocation = gl.getUniformLocation(program, 'color');
    
    // Create particles
    const particleCount = 200;
    const particles = new Float32Array(particleCount * 2);
    const velocities = new Float32Array(particleCount * 2);
    const colors = [
        [1.0, 0.62, 0.0],  // Orange
        [0.55, 0.32, 1.0], // Purple
        [0.36, 0.88, 0.9], // Cyan
        [1.0, 0.84, 0.0],  // Gold
        [0.69, 0.15, 1.0]  // Violet
    ];
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles[i * 2] = Math.random() * 2 - 1;     // x position
        particles[i * 2 + 1] = Math.random() * 2 - 1; // y position
        velocities[i * 2] = (Math.random() - 0.5) * 0.01;
        velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.01;
    }
    
    // Animation function
    function animate() {
        // Clear canvas
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Update particle positions
        for (let i = 0; i < particleCount; i++) {
            particles[i * 2] += velocities[i * 2];
            particles[i * 2 + 1] += velocities[i * 2 + 1];
            
            // Wrap around edges
            if (particles[i * 2] > 1) particles[i * 2] = -1;
            if (particles[i * 2] < -1) particles[i * 2] = 1;
            if (particles[i * 2 + 1] > 1) particles[i * 2 + 1] = -1;
            if (particles[i * 2 + 1] < -1) particles[i * 2 + 1] = 1;
        }
        
        // Draw particles in batches by color
        for (let c = 0; c < colors.length; c++) {
            // Set color
            gl.uniform3fv(colorLocation, colors[c]);
            
            // Calculate batch size
            const batchSize = Math.floor(particleCount / colors.length);
            const start = c * batchSize;
            const end = (c === colors.length - 1) ? particleCount : (c + 1) * batchSize;
            
            // Create batch buffer
            const batch = new Float32Array((end - start) * 2);
            for (let i = start; i < end; i++) {
                batch[(i - start) * 2] = particles[i * 2];
                batch[(i - start) * 2 + 1] = particles[i * 2 + 1];
            }
            
            // Buffer data and draw
            gl.bufferData(gl.ARRAY_BUFFER, batch, gl.STATIC_DRAW);
            gl.drawArrays(gl.POINTS, 0, end - start);
        }
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
}

// Create WebGL program
function createProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }
    
    return program;
}

// Load shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

// Animate elements when they come into view
function animateElementsOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll:not(.active)');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('active');
        }
    });
}

// Fallback method for copying to clipboard
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification('IP copied to clipboard!', 'success');
        } else {
            showNotification('Failed to copy IP', 'error');
        }
    } catch (err) {
        showNotification('Failed to copy IP', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add icon based on type
    const icon = document.createElement('i');
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    notification.insertBefore(icon, notification.firstChild);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Animate copy button when clicked
function animateCopyButton(button) {
    button.classList.add('active');
    
    // Reset after animation
    setTimeout(() => {
        button.classList.remove('active');
    }, 500);
}

// Announcements functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load announcements if the container exists
    const announcementsContainer = document.getElementById('announcementsContainer');
    if (announcementsContainer) {
        loadAnnouncements();
    }
});

/**
 * Loads announcements from Firebase or localStorage
 */
async function loadAnnouncements() {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;
    
    try {
        // Show loading spinner
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading announcements...</p>
            </div>
        `;
        
        // Use syncAnnouncements to get merged announcements from both sources
        let announcements = [];
        
        try {
            // Try to get announcements using the sync function
            if (typeof syncAnnouncements === 'function') {
                announcements = await syncAnnouncements();
                console.log('Loaded announcements using syncAnnouncements:', announcements.length);
            } else {
                // Fall back to direct loading
                console.log('syncAnnouncements function not available, loading directly');
                
                // Try to load from Firebase if available
                let firebaseLoaded = false;
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    try {
                        const db = firebase.firestore();
                        const snapshot = await db.collection('announcements')
                            .orderBy('createdAt', 'desc')
                            .limit(5)
                            .get();
                            
                        if (!snapshot.empty) {
                            snapshot.forEach(doc => {
                                const data = doc.data();
                                announcements.push({
                                    id: doc.id,
                                    title: data.title,
                                    content: data.content,
                                    type: data.type || 'update',
                                    timestamp: data.createdAt?.toDate() || data.timestamp || new Date()
                                });
                            });
                            firebaseLoaded = true;
                            console.log('Loaded from Firebase directly:', announcements.length);
                        }
                    } catch (firebaseError) {
                        console.warn('Error loading announcements from Firebase:', firebaseError);
                    }
                }
                
                // Fall back to localStorage if Firebase failed or is not available
                if (!firebaseLoaded || announcements.length === 0) {
                    try {
                        const savedAnnouncements = localStorage.getItem('announcements');
                        if (savedAnnouncements) {
                            const parsedAnnouncements = JSON.parse(savedAnnouncements);
                            announcements = parsedAnnouncements.slice(0, 5); // Limit to 5
                            console.log('Loaded from localStorage directly:', announcements.length);
                        }
                    } catch (localStorageError) {
                        console.warn('Error loading announcements from localStorage:', localStorageError);
                    }
                }
            }
        } catch (syncError) {
            console.error('Error syncing announcements:', syncError);
            
            // Fallback to localStorage as a last resort
            try {
                const savedAnnouncements = localStorage.getItem('announcements');
                if (savedAnnouncements) {
                    announcements = JSON.parse(savedAnnouncements).slice(0, 5);
                    console.log('Fallback to localStorage after sync error:', announcements.length);
                }
            } catch (e) {
                console.error('Complete failure loading announcements:', e);
            }
        }
        
        // Sort announcements by date (newest first)
        announcements.sort((a, b) => {
            const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
            const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
            return dateB - dateA;
        });
        
        console.log('Final sorted announcements:', announcements.length);
        
        // Render announcements
        renderAnnouncements(container, announcements);
        
        // Initialize AOS for animations if it exists
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    } catch (error) {
        console.error('Error in loadAnnouncements:', error);
        container.innerHTML = `
            <div class="announcements-empty">
                <p>Unable to load announcements at this time.</p>
            </div>
        `;
    }
}

/**
 * Renders announcements in the specified container
 */
function renderAnnouncements(container, announcements) {
    if (!announcements || announcements.length === 0) {
        container.innerHTML = `
            <div class="announcements-empty">
                <p>No announcements available at this time.</p>
            </div>
        `;
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Add each announcement
    announcements.forEach((announcement, index) => {
        const date = announcement.timestamp instanceof Date 
            ? announcement.timestamp 
            : new Date(announcement.timestamp);
        
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const card = document.createElement('div');
        card.className = 'announcement-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index * 100).toString());
        
        card.innerHTML = `
            <div class="announcement-type ${announcement.type || 'update'}">${announcement.type || 'update'}</div>
            <div class="announcement-content">
                <h3>${announcement.title || 'Untitled Announcement'}</h3>
                <p>${announcement.content || ''}</p>
                <div class="announcement-meta">
                    <span>Posted on ${formattedDate} at ${formattedTime}</span>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Initialize tooltips
function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseover', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            
            // Add to document
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            
            // Show tooltip
            setTimeout(() => {
                tooltip.classList.add('show');
            }, 10);
            
            // Remove on mouseout
            const removeTooltip = function() {
                tooltip.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(tooltip);
                }, 300);
                element.removeEventListener('mouseout', removeTooltip);
            };
            
            element.addEventListener('mouseout', removeTooltip);
        });
    });
}

// Add dynamic styles for the notification system
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        font-weight: 500;
        color: white;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        max-width: 350px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        background: rgba(76, 175, 80, 0.9);
        border-left: 4px solid #2e7d32;
    }
    
    .notification.error {
        background: rgba(244, 67, 54, 0.9);
        border-left: 4px solid #c62828;
    }
    
    .notification.warning {
        background: rgba(255, 152, 0, 0.9);
        border-left: 4px solid #ef6c00;
    }
    
    .notification.info {
        background: rgba(33, 150, 243, 0.9);
        border-left: 4px solid #1565c0;
    }
    
    /* Tooltip styles */
    .tooltip {
        position: fixed;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 4px;
        font-size: 0.9rem;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        max-width: 200px;
        text-align: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }
    
    .tooltip::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid rgba(0, 0, 0, 0.8);
    }
    
    .tooltip.show {
        opacity: 1;
    }
    
    /* Copy button animation */
    .copy-ip.active {
        transform: scale(1.1);
        background: var(--accent-gradient);
    }
    
    /* Announcement cards */
    .announcement-card {
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid var(--glass-border);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .announcement-card:hover {
        transform: translateY(-5px);
        border-color: rgba(255, 157, 0, 0.3);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    .announcement-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 5px;
        height: 100%;
        transition: all 0.3s ease;
    }
    
    .announcement-card.maintenance::before {
        background: linear-gradient(to bottom, #ff9800, #ff5722);
    }
    
    .announcement-card.event::before {
        background: linear-gradient(to bottom, #4caf50, #8bc34a);
    }
    
    .announcement-card.update::before {
        background: linear-gradient(to bottom, #2196f3, #03a9f4);
    }
    
    .announcement-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        gap: 10px;
    }
    
    .announcement-type {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--glass-bg-light);
        color: var(--primary-color);
    }
    
    .announcement-title {
        flex-grow: 1;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-light);
        margin-right: 10px;
    }
    
    .announcement-date {
        font-size: 0.85rem;
        color: var(--text-faded);
    }
    
    .announcement-content {
        color: var(--text-faded);
        line-height: 1.6;
        margin-bottom: 15px;
    }
    
    .announcement-footer {
        font-size: 0.9rem;
        color: var(--text-faded);
        border-top: 1px solid var(--border-color);
        padding-top: 15px;
    }
    
    .announcement-card.maintenance .announcement-type { color: #ff9800; }
    .announcement-card.event .announcement-type { color: #4caf50; }
    .announcement-card.update .announcement-type { color: #2196f3; }
`;

document.head.appendChild(notificationStyles);

// Enhanced 3D and Premium Effects
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animation library
    AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        once: false
    });
    
    // 3D tilt effect for cards
    const cards = document.querySelectorAll('.package-card, .category-item, .info-card');
    cards.forEach(card => {
        card.classList.add('js-tilt');
        initTilt(card);
    });
    
    // Parallax effect for sections
    window.addEventListener('scroll', function() {
        const parallaxElements = document.querySelectorAll('.hero, .footer, .page-title');
        parallaxElements.forEach(element => {
            const scrollPosition = window.pageYOffset;
            const elementPosition = element.offsetTop;
            const distance = (elementPosition - scrollPosition) * 0.15;
            element.style.transform = `translateY(${distance}px) translateZ(0)`;
        });
    });
    
    // 3D depth for hero particles
    const heroParticles = document.querySelectorAll('.hero-particle');
    heroParticles.forEach((particle, index) => {
        particle.style.animationDelay = `${index * 0.5}s`;
        particle.style.animationDuration = `${8 + Math.random() * 5}s`;
    });
    
    // Premium text glowing effect
    const glowElements = document.querySelectorAll('.glow-text, .premium-text');
    glowElements.forEach(element => {
        setInterval(() => {
            element.classList.toggle('premium-glow');
        }, 2000);
    });
    
    // 3D mousemove effect
    document.addEventListener('mousemove', function(e) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        
        document.querySelectorAll('.hero-content > *').forEach(element => {
            element.style.transform = `translateZ(50px) translate(${moveX * 3}px, ${moveY * 3}px)`;
        });
        
        document.querySelectorAll('.mc-block').forEach(block => {
            const randomFactor = Math.random() * 2 + 1;
            block.style.transform = `translate(${moveX * randomFactor}px, ${moveY * randomFactor}px) translateZ(20px)`;
        });
    });
    
    // Enhanced floating animation for logo
    const logo = document.querySelector('.logo img');
    if (logo) {
        logo.addEventListener('mouseenter', function() {
            this.style.animation = 'floating 2s ease-in-out infinite, spin 10s linear infinite';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.animation = 'floating 5s ease-in-out infinite';
        });
    }
    
    // 3D effect for server IP display
    const serverIp = document.querySelector('.server-ip');
    if (serverIp) {
        serverIp.addEventListener('mouseenter', function() {
            this.style.transform = 'translateZ(30px) scale(1.1)';
            this.style.boxShadow = '0 15px 35px rgba(65, 88, 208, 0.3), 0 5px 15px rgba(200, 80, 192, 0.4)';
        });
        
        serverIp.addEventListener('mouseleave', function() {
            this.style.transform = 'translateZ(0) scale(1)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    }
    
    // Create floating 3D particles in background
    createBackgroundParticles();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navButtons = document.querySelector('.nav-buttons');
    
    if (mobileMenuToggle && navButtons) {
        mobileMenuToggle.addEventListener('click', function() {
            navButtons.classList.toggle('show');
            this.classList.toggle('active');
        });
    }
    
    // Copy server IP functionality
    const copyIpBtn = document.querySelector('.copy-ip');
    if (copyIpBtn) {
        copyIpBtn.addEventListener('click', function() {
            const ip = this.getAttribute('data-ip');
            navigator.clipboard.writeText(ip).then(() => {
                // Create a copied notification
                const notification = document.createElement('div');
                notification.classList.add('copy-notification');
                notification.innerHTML = '<i class="fas fa-check"></i> IP Copied!';
                document.body.appendChild(notification);
                
                // Animate and remove the notification
                setTimeout(() => {
                    notification.classList.add('show');
                    setTimeout(() => {
                        notification.classList.remove('show');
                        setTimeout(() => {
                            notification.remove();
                        }, 300);
                    }, 2000);
                }, 10);
            });
        });
    }
    
    // Initialize canvas background
    initCanvasBackground();
});

// 3D tilt effect initialization
function initTilt(element) {
    element.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const angleX = (y - centerY) / 10;
        const angleY = (centerX - x) / 10;
        
        this.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(10px) scale(1.05)`;
        
        // Add dynamic glow effect based on mouse position
        const glowOverlay = this.querySelector('.card-glow-overlay');
        if (glowOverlay) {
            const percentX = x / rect.width * 100;
            const percentY = y / rect.height * 100;
            glowOverlay.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(140, 82, 255, 0.3) 0%, rgba(140, 82, 255, 0.1) 30%, rgba(0, 0, 0, 0) 70%)`;
            glowOverlay.style.opacity = '1';
        }
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)';
        
        // Reset glow overlay
        const glowOverlay = this.querySelector('.card-glow-overlay');
        if (glowOverlay) {
            glowOverlay.style.background = '';
            glowOverlay.style.opacity = '0';
        }
    });
    
    // Add glow overlay if it doesn't exist
    if (!element.querySelector('.card-glow-overlay')) {
        const glowOverlay = document.createElement('div');
        glowOverlay.className = 'card-glow-overlay';
        element.prepend(glowOverlay);
    }
}

// Create floating 3D particles in background
function createBackgroundParticles() {
    const container = document.createElement('div');
    container.classList.add('background-particles');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-1';
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 5 + 2;
        
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = 'linear-gradient(45deg, #4158D0, #C850C0)';
        particle.style.borderRadius = '50%';
        particle.style.opacity = `${Math.random() * 0.3 + 0.1}`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animation = `particle3D ${Math.random() * 20 + 10}s infinite ease-in-out`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        
        container.appendChild(particle);
    }
    
    document.body.appendChild(container);
}

// Initialize canvas background
function initCanvasBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create grid points
    const gridSize = 30;
    const spacing = 50;
    const points = [];
    
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            points.push({
                x: x * spacing - gridSize * spacing / 2 + canvas.width / 2,
                y: y * spacing - gridSize * spacing / 2 + canvas.height / 2,
                originX: x * spacing - gridSize * spacing / 2 + canvas.width / 2,
                originY: y * spacing - gridSize * spacing / 2 + canvas.height / 2,
                vx: 0,
                vy: 0
            });
        }
    }
    
    // Animation loop
    let mouseX = 0;
    let mouseY = 0;
    
    window.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        points.forEach(point => {
            const dx = mouseX - point.x;
            const dy = mouseY - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 200;
            
            if (dist < maxDist) {
                const force = (1 - dist / maxDist) * 0.5;
                point.vx += -dx * force / 10;
                point.vy += -dy * force / 10;
            }
            
            // Return to original position
            point.vx += (point.originX - point.x) * 0.03;
            point.vy += (point.originY - point.y) * 0.03;
            
            // Apply friction
            point.vx *= 0.9;
            point.vy *= 0.9;
            
            // Update position
            point.x += point.vx;
            point.y += point.vy;
            
            // Draw point
            ctx.beginPath();
            ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(65, 88, 208, 0.5)';
            ctx.fill();
            
            // Connect nearby points
            points.forEach(otherPoint => {
                const dx = point.x - otherPoint.x;
                const dy = point.y - otherPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 70) {
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(otherPoint.x, otherPoint.y);
                    ctx.strokeStyle = `rgba(200, 80, 192, ${(1 - distance / 70) * 0.2})`;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Add custom CSS styles for notifications
const style = document.createElement('style');
style.textContent = `
    .copy-notification {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: linear-gradient(45deg, #4158D0, #C850C0);
        color: white;
        padding: 12px 20px;
        border-radius: 50px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
        font-weight: bold;
    }
    
    .copy-notification.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    
    .copy-notification i {
        margin-right: 8px;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes gradientAnimation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
`;

document.head.appendChild(style);

// Function to sync announcements between Firebase and localStorage
async function syncAnnouncements() {
    console.log("Starting syncAnnouncements...");
    
    // Try to load announcements from Firebase
    let firebaseAnnouncements = [];
    let firebaseAvailable = false;
    
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            console.log("Firebase SDK is available, attempting to fetch announcements");
            firebaseAvailable = true;
            const db = firebase.firestore();
            
            // Get announcements from Firestore, ordered by creation date
            try {
                const snapshot = await db.collection('announcements')
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .get();
                
                console.log(`Firebase query complete, snapshot empty: ${snapshot.empty}`);
                    
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        firebaseAnnouncements.push({
                            id: doc.id,
                            title: data.title,
                            content: data.content,
                            type: data.type || 'update',
                            timestamp: data.createdAt?.toDate() || data.timestamp || new Date()
                        });
                    });
                    
                    console.log(`Loaded ${firebaseAnnouncements.length} announcements from Firebase`);
                } else {
                    console.log("Firebase returned an empty collection");
                }
            } catch (queryError) {
                console.error("Error querying Firebase:", queryError);
                firebaseAvailable = false;
            }
        } else {
            console.log("Firebase SDK not available");
        }
    } catch (error) {
        console.warn('Error accessing Firebase:', error);
        firebaseAvailable = false;
    }
    
    // Try to load from the local JSON file
    let fileAnnouncements = [];
    try {
        console.log("Attempting to fetch announcements from local JSON file");
        const response = await fetch('./announcements/announcements.json');
        if (response.ok) {
            fileAnnouncements = await response.json();
            console.log(`Loaded ${fileAnnouncements.length} announcements from local JSON file`);
        } else {
            console.log(`Could not load from JSON file: ${response.status} ${response.statusText}`);
        }
    } catch (fileError) {
        console.warn('Error loading announcements from JSON file:', fileError);
    }
    
    // Load from localStorage
    let localAnnouncements = [];
    try {
        const savedAnnouncements = localStorage.getItem('announcements');
        if (savedAnnouncements) {
            localAnnouncements = JSON.parse(savedAnnouncements);
            console.log(`Loaded ${localAnnouncements.length} announcements from localStorage`);
        } else {
            console.log("No announcements found in localStorage");
        }
    } catch (error) {
        console.warn('Error loading announcements from localStorage:', error);
    }
    
    // Merge announcements, with priority: Firebase > Local JSON file > localStorage
    let allAnnouncements = [];
    
    if (firebaseAvailable && firebaseAnnouncements.length > 0) {
        console.log("Using Firebase as primary source");
        // Use Firebase as primary source
        allAnnouncements = [...firebaseAnnouncements];
        
        // Add announcements from other sources if they don't exist in Firebase
        const firebaseIds = firebaseAnnouncements.map(a => a.id);
        
        // Add file announcements not in Firebase
        if (fileAnnouncements.length > 0) {
            const uniqueFileAnnouncements = fileAnnouncements.filter(a => !firebaseIds.includes(a.id));
            console.log(`Found ${uniqueFileAnnouncements.length} unique file announcements not in Firebase`);
            allAnnouncements = [...allAnnouncements, ...uniqueFileAnnouncements];
        }
        
        // Add local announcements not already included
        const existingIds = allAnnouncements.map(a => a.id);
        const uniqueLocalAnnouncements = localAnnouncements.filter(a => !existingIds.includes(a.id));
        console.log(`Found ${uniqueLocalAnnouncements.length} unique localStorage announcements not already included`);
        allAnnouncements = [...allAnnouncements, ...uniqueLocalAnnouncements];
    } else if (fileAnnouncements.length > 0) {
        console.log("Using local JSON file as primary source");
        // Use file announcements as the primary source
        allAnnouncements = [...fileAnnouncements];
        
        // Add local announcements not in file announcements
        const fileIds = fileAnnouncements.map(a => a.id);
        const uniqueLocalAnnouncements = localAnnouncements.filter(a => !fileIds.includes(a.id));
        console.log(`Found ${uniqueLocalAnnouncements.length} unique localStorage announcements not in file`);
        allAnnouncements = [...allAnnouncements, ...uniqueLocalAnnouncements];
    } else {
        console.log("Using localStorage as primary source");
        // Use local announcements as the source
        allAnnouncements = [...localAnnouncements];
    }
    
    console.log(`Total merged announcements: ${allAnnouncements.length}`);
    
    // Sort all announcements by date (newest first)
    allAnnouncements.sort((a, b) => {
        const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return dateB - dateA;
    });
    
    // Update localStorage with the merged announcements for offline access
    try {
        localStorage.setItem('announcements', JSON.stringify(allAnnouncements));
        console.log("Successfully updated localStorage with merged announcements");
    } catch (saveError) {
        console.error("Error saving merged announcements to localStorage:", saveError);
    }
    
    console.log(`Sync complete: ${allAnnouncements.length} total announcements`);
    
    // Log the first few announcements for debugging
    if (allAnnouncements.length > 0) {
        console.log("First announcement:", {
            id: allAnnouncements[0].id,
            title: allAnnouncements[0].title,
            type: allAnnouncements[0].type,
            timestamp: allAnnouncements[0].timestamp
        });
    }
    
    return allAnnouncements;
} 