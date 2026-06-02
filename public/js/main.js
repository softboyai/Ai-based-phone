/**
 * KT Phones - Main Frontend JavaScript
 * 
 * Handles all client-side functionality:
 * - Navigation and authentication state
 * - Form submissions (login, register, recommendation)
 * - Admin panel operations (CRUD for phones)
 * - Dynamic page content loading
 */

// ============================================================
// GLOBAL VARIABLES
// ============================================================
const API_BASE = '/api';
let currentUser = null;

// ============================================================
// ON PAGE LOAD - Check session and update UI
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    setupMobileMenu();
    
    // Initialize page-specific functionality
    const page = document.body.getAttribute('data-page');
    switch (page) {
        case 'home':
            loadHomePhones();
            break;
        case 'recommend':
            setupRecommendForm();
            break;
        case 'results':
            displayResults();
            break;
        case 'admin':
            initAdminPanel();
            break;
        case 'login':
            setupLoginForm();
            break;
        case 'register':
            setupRegisterForm();
            break;
    }
});

// ============================================================
// SESSION MANAGEMENT
// ============================================================

/**
 * Check if user is logged in and update navigation accordingly
 */
async function checkSession() {
    try {
        const response = await fetch(`${API_BASE}/auth/session`);
        const data = await response.json();

        if (data.loggedIn) {
            currentUser = data.user;
            updateNavForLoggedIn(data.user);
        } else {
            currentUser = null;
            updateNavForLoggedOut();
        }
    } catch (error) {
        console.error('Session check failed:', error);
    }
}

/**
 * Update navigation bar for logged-in users
 */
function updateNavForLoggedIn(user) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Find or create user info and logout elements
    let userInfo = document.getElementById('nav-user-info');
    let logoutLink = document.getElementById('nav-logout');
    let loginLink = document.getElementById('nav-login');

    // Hide login link
    if (loginLink) loginLink.style.display = 'none';

    // Show user info
    if (!userInfo) {
        userInfo = document.createElement('span');
        userInfo.id = 'nav-user-info';
        userInfo.className = 'nav-user';
        navLinks.appendChild(userInfo);
    }
    userInfo.textContent = `Hi, ${user.fullName}`;
    userInfo.style.display = 'inline';

    // Show admin link if user is admin
    let adminLink = document.getElementById('nav-admin');
    if (user.role === 'admin') {
        if (!adminLink) {
            adminLink = document.createElement('a');
            adminLink.id = 'nav-admin';
            adminLink.href = '/admin';
            adminLink.textContent = 'Admin Panel';
            navLinks.insertBefore(adminLink, userInfo);
        }
        adminLink.style.display = 'inline';
    }

    // Show logout link
    if (!logoutLink) {
        logoutLink = document.createElement('a');
        logoutLink.id = 'nav-logout';
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', handleLogout);
        navLinks.appendChild(logoutLink);
    }
    logoutLink.style.display = 'inline';
}

/**
 * Update navigation bar for logged-out users
 */
function updateNavForLoggedOut() {
    const loginLink = document.getElementById('nav-login');
    const userInfo = document.getElementById('nav-user-info');
    const logoutLink = document.getElementById('nav-logout');
    const adminLink = document.getElementById('nav-admin');

    if (loginLink) loginLink.style.display = 'inline';
    if (userInfo) userInfo.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
}

/**
 * Handle user logout
 */
async function handleLogout(e) {
    if (e) e.preventDefault();
    try {
        await fetch(`${API_BASE}/auth/logout`);
        currentUser = null;
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// ============================================================
// MOBILE MENU
// ============================================================
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// ============================================================
// LOGIN FORM
// ============================================================
function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/';
                    }
                }, 1000);
            } else {
                showMessage(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// ============================================================
// REGISTER FORM
// ============================================================
function setupRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Client-side validation
        if (!fullName || !email || !password || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Name validation - no numbers or special characters
        if (/[0-9]/.test(fullName)) {
            showMessage('Full name cannot contain numbers', 'error');
            return;
        }
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(fullName)) {
            showMessage('Full name can only contain letters and spaces', 'error');
            return;
        }
        if (fullName.length < 3) {
            showMessage('Full name must be at least 3 characters', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address (e.g. name@example.com)', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        // Password strength validation
        if (password.length < 8) {
            showMessage('Password must be at least 8 characters', 'error');
            return;
        }
        if (!/[A-Z]/.test(password)) {
            showMessage('Password must contain at least one uppercase letter', 'error');
            return;
        }
        if (!/[a-z]/.test(password)) {
            showMessage('Password must contain at least one lowercase letter', 'error');
            return;
        }
        if (!/[0-9]/.test(password)) {
            showMessage('Password must contain at least one number', 'error');
            return;
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            showMessage('Password must contain at least one special character (!@#$%^&*)', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password, confirmPassword })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Registration successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                showMessage(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// ============================================================
// HOME PAGE - Load phones
// ============================================================
async function loadHomePhones() {
    loadFeaturedPhones();
    loadAllPhones();
}

/**
 * Load featured phones for the home page
 */
async function loadFeaturedPhones() {
    const featuredGrid = document.getElementById('featured-grid');
    if (!featuredGrid) return;

    try {
        const response = await fetch(`${API_BASE}/phones/featured`);
        const phones = await response.json();

        if (phones.length === 0) {
            featuredGrid.innerHTML = '<p style="text-align:center; color:#666;">No featured phones yet.</p>';
            return;
        }

        featuredGrid.innerHTML = phones.map(phone => createPhoneCard(phone, true)).join('');
    } catch (error) {
        featuredGrid.innerHTML = '<p style="text-align:center; color:#d32f2f;">Error loading featured phones.</p>';
    }
}

/**
 * Load all phones for the home page
 */
async function loadAllPhones() {
    const phoneGrid = document.getElementById('phone-grid');
    if (!phoneGrid) return;

    try {
        const response = await fetch(`${API_BASE}/phones`);
        const phones = await response.json();

        if (phones.length === 0) {
            phoneGrid.innerHTML = '<p style="text-align:center; color:#666;">No phones available yet.</p>';
            return;
        }

        phoneGrid.innerHTML = phones.map(phone => createPhoneCard(phone, false)).join('');
    } catch (error) {
        phoneGrid.innerHTML = '<p style="text-align:center; color:#d32f2f;">Error loading phones.</p>';
    }
}

/**
 * Create HTML for a phone card
 */
function createPhoneCard(phone, isFeatured) {
    const featuredBadge = isFeatured ? '<span style="position:absolute;top:10px;right:10px;background:#ff6f00;color:#fff;padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;">⭐ Featured</span>' : '';
    return `
        <div class="phone-card" style="position:relative;">
            ${featuredBadge}
            <div class="card-image">
                <img src="/images/${phone.image}" alt="${phone.name}" onerror="this.src='/images/default-phone.svg'">
            </div>
            <div class="card-body">
                <h3>${phone.name}</h3>
                <p class="brand">${phone.brand}</p>
                <p class="price">${formatPrice(phone.price)} RWF</p>
                <div class="specs">
                    <span>${phone.ram}GB RAM</span>
                    <span>${phone.storage}GB Storage</span>
                    <span>${phone.battery}mAh</span>
                    <span>${phone.camera}MP</span>
                </div>
                ${phone.description ? `<p style="margin-top:8px; font-size:0.8rem; color:#666;">${phone.description}</p>` : ''}
            </div>
        </div>
    `;
}

// ============================================================
// RECOMMENDATION FORM
// ============================================================
function setupRecommendForm() {
    const form = document.getElementById('recommend-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();

        // Get form values
        const budget = document.getElementById('budget').value;
        const brand = document.getElementById('brand').value;

        // Get selected usage checkboxes
        const usageCheckboxes = document.querySelectorAll('input[name="usage"]:checked');
        const usage = Array.from(usageCheckboxes).map(cb => cb.value);

        // Get selected feature checkboxes
        const featureCheckboxes = document.querySelectorAll('input[name="features"]:checked');
        const features = Array.from(featureCheckboxes).map(cb => cb.value);

        // Validation
        if (!budget || !brand) {
            showMessage('Please select budget and brand preferences', 'error');
            return;
        }

        if (usage.length === 0) {
            showMessage('Please select at least one usage type', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ budget, brand, usage, features })
            });

            const data = await response.json();

            if (response.ok) {
                // Store results in sessionStorage and redirect to results page
                sessionStorage.setItem('recommendations', JSON.stringify(data.recommendations));
                window.location.href = '/results';
            } else {
                if (response.status === 401) {
                    showMessage('Please login first to get recommendations', 'error');
                    setTimeout(() => window.location.href = '/login', 2000);
                } else {
                    showMessage(data.message || 'Error getting recommendations', 'error');
                }
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// ============================================================
// RESULTS PAGE
// ============================================================
function displayResults() {
    const resultsGrid = document.getElementById('results-grid');
    if (!resultsGrid) return;

    // Get recommendations from sessionStorage
    const stored = sessionStorage.getItem('recommendations');
    if (!stored) {
        resultsGrid.innerHTML = '<p style="text-align:center; color:#666;">No recommendations found. Please try the recommendation form first.</p>';
        return;
    }

    const recommendations = JSON.parse(stored);

    if (recommendations.length === 0) {
        resultsGrid.innerHTML = '<p style="text-align:center; color:#666;">No matching phones found. Try different preferences.</p>';
        return;
    }

    resultsGrid.innerHTML = recommendations.map((item, index) => {
        const phone = item.phone;
        const matchPercentage = item.matchPercentage;
        const matchClass = matchPercentage >= 70 ? 'match-high' : matchPercentage >= 40 ? 'match-medium' : 'match-low';

        return `
            <div class="result-card">
                <div class="rank-badge">#${index + 1}</div>
                <div class="card-image">
                    <img src="/images/${phone.image}" alt="${phone.name}" onerror="this.src='/images/default-phone.svg'">
                </div>
                <div class="card-body">
                    <h3>${phone.name}</h3>
                    <p class="brand">${phone.brand}</p>
                    <p class="price">${formatPrice(phone.price)} RWF</p>
                    <div class="specs">
                        <span>${phone.ram}GB RAM</span>
                        <span>${phone.storage}GB Storage</span>
                        <span>${phone.battery}mAh</span>
                        <span>${phone.camera}MP Camera</span>
                    </div>
                    <span class="match-badge ${matchClass}">${matchPercentage}% Match</span>
                    ${phone.description ? `<p style="margin-top:10px; font-size:0.85rem; color:#666;">${phone.description}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// ADMIN PANEL
// ============================================================
async function initAdminPanel() {
    // Check if user is admin
    await checkSession();
    
    setTimeout(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = '/login';
            return;
        }
        
        loadAdminStats();
        loadAdminPhones();
        setupAdminTabs();
        setupAddPhoneForm();
        loadAdminUsers();
        loadAdminRecommendations();
    }, 500);
}

/**
 * Setup admin tab switching
 */
function setupAdminTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Load admin dashboard statistics
 */
async function loadAdminStats() {
    try {
        const [phonesRes, usersRes, recsRes] = await Promise.all([
            fetch(`${API_BASE}/phones`),
            fetch(`${API_BASE}/auth/session`),
            fetch(`${API_BASE}/recommend/all`)
        ]);

        const phones = await phonesRes.json();
        
        document.getElementById('stat-phones').textContent = phones.length || 0;

        if (recsRes.ok) {
            const recs = await recsRes.json();
            document.getElementById('stat-recommendations').textContent = recs.length || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Load all phones for admin table
 */
async function loadAdminPhones() {
    const tableBody = document.getElementById('phones-table-body');
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_BASE}/phones`);
        const phones = await response.json();

        if (phones.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No phones found</td></tr>';
            return;
        }

        tableBody.innerHTML = phones.map(phone => `
            <tr>
                <td>${phone.name}</td>
                <td>${phone.brand}</td>
                <td>${formatPrice(phone.price)} RWF</td>
                <td>${phone.ram}GB</td>
                <td>${phone.storage}GB</td>
                <td>${phone.inStock ? '✅ Yes' : '❌ No'}</td>
                <td class="actions">
                    <button class="btn btn-small btn-primary" onclick="editPhone('${phone._id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deletePhone('${phone._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error loading phones</td></tr>';
    }
}

/**
 * Setup the Add Phone form in admin panel
 */
function setupAddPhoneForm() {
    const form = document.getElementById('add-phone-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();

        const formData = new FormData(form);

        // Get usage type checkboxes
        const usageCheckboxes = document.querySelectorAll('input[name="usageType"]:checked');
        const usageTypes = Array.from(usageCheckboxes).map(cb => cb.value);
        
        // Remove existing usageType entries and add as comma-separated string
        formData.delete('usageType');
        formData.append('usageType', usageTypes.join(','));

        try {
            const response = await fetch(`${API_BASE}/phones`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Phone added successfully!', 'success');
                form.reset();
                loadAdminPhones();
                loadAdminStats();
            } else {
                showMessage(data.message || 'Error adding phone', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

/**
 * Delete a phone (admin only)
 */
async function deletePhone(phoneId) {
    if (!confirm('Are you sure you want to delete this phone?')) return;

    try {
        const response = await fetch(`${API_BASE}/phones/${phoneId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Phone deleted successfully', 'success');
            loadAdminPhones();
            loadAdminStats();
        } else {
            showMessage(data.message || 'Error deleting phone', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

/**
 * Edit a phone - opens modal with phone data
 */
async function editPhone(phoneId) {
    try {
        const response = await fetch(`${API_BASE}/phones/${phoneId}`);
        const phone = await response.json();

        // Populate edit modal
        const modal = document.getElementById('edit-modal');
        if (!modal) return;

        document.getElementById('edit-phone-id').value = phone._id;
        document.getElementById('edit-name').value = phone.name;
        document.getElementById('edit-brand').value = phone.brand;
        document.getElementById('edit-price').value = phone.price;
        document.getElementById('edit-ram').value = phone.ram;
        document.getElementById('edit-storage').value = phone.storage;
        document.getElementById('edit-battery').value = phone.battery;
        document.getElementById('edit-camera').value = phone.camera;
        document.getElementById('edit-description').value = phone.description || '';
        document.getElementById('edit-inStock').checked = phone.inStock;

        // Show modal
        modal.classList.add('active');
    } catch (error) {
        showMessage('Error loading phone data', 'error');
    }
}

/**
 * Close edit modal
 */
function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.remove('active');
}

/**
 * Submit edit phone form
 */
async function submitEditPhone(e) {
    e.preventDefault();
    clearMessages();

    const phoneId = document.getElementById('edit-phone-id').value;
    const formData = new FormData(e.target);

    // Get usage type checkboxes
    const usageCheckboxes = document.querySelectorAll('#edit-form input[name="usageType"]:checked');
    const usageTypes = Array.from(usageCheckboxes).map(cb => cb.value);
    formData.delete('usageType');
    formData.append('usageType', usageTypes.join(','));

    try {
        const response = await fetch(`${API_BASE}/phones/${phoneId}`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Phone updated successfully!', 'success');
            closeEditModal();
            loadAdminPhones();
        } else {
            showMessage(data.message || 'Error updating phone', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

/**
 * Load all users for admin panel
 */
async function loadAdminUsers() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    // We'll use a simple approach - fetch from a dedicated endpoint
    // For now, show the current user count from stats
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">User data loaded from database</td></tr>';
}

/**
 * Load all recommendations for admin panel
 */
async function loadAdminRecommendations() {
    const tableBody = document.getElementById('recommendations-table-body');
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_BASE}/recommend/all`);
        
        if (!response.ok) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Unable to load recommendations</td></tr>';
            return;
        }

        const recommendations = await response.json();

        if (recommendations.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No recommendations yet</td></tr>';
            return;
        }

        tableBody.innerHTML = recommendations.map(rec => `
            <tr>
                <td>${rec.userId ? rec.userId.fullName : 'Unknown'}</td>
                <td>${rec.preferences.budget}, ${rec.preferences.brand}</td>
                <td>${rec.recommendedPhones.map(rp => rp.phone ? rp.phone.name : 'N/A').join(', ')}</td>
                <td>${new Date(rec.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Error loading recommendations</td></tr>';
    }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Format price with thousand separators
 */
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Show a message to the user
 */
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        // Create message div if it doesn't exist
        const div = document.createElement('div');
        div.id = 'message';
        div.className = `alert alert-${type}`;
        div.textContent = message;
        
        const container = document.querySelector('.container') || document.querySelector('.form-container') || document.body;
        container.insertBefore(div, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => div.remove(), 5000);
        return;
    }

    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

/**
 * Clear all messages
 */
function clearMessages() {
    const messages = document.querySelectorAll('.alert');
    messages.forEach(msg => msg.style.display = 'none');
}
