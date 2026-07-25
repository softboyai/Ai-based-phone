/**
 * Authentication Controller
 * 
 * Handles user registration, login, and logout.
 * Uses bcrypt for password hashing and express-session for session management.
 */

const User = require('../models/User');

// ============================================================
// REGISTER A NEW USER
// ============================================================
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;

        // Validate that all fields are provided
        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Strong password validation
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
        }
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one number' });
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*)' });
        }
        // Reject simple repeated characters like 1111, aaaa, 1234
        if (/(.)\1{3,}/.test(password)) {
            return res.status(400).json({ message: 'Password cannot contain 4 or more repeated characters' });
        }
        if (/1234|2345|3456|4567|5678|6789|abcd|bcde|cdef/.test(password.toLowerCase())) {
            return res.status(400).json({ message: 'Password cannot contain sequential characters like 1234 or abcd' });
        }

        // Full name validation - must be letters and spaces only, no numbers
        if (/[0-9]/.test(fullName)) {
            return res.status(400).json({ message: 'Full name cannot contain numbers' });
        }
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/.test(fullName)) {
            return res.status(400).json({ message: 'Full name can only contain letters and spaces' });
        }
        if (fullName.trim().length < 3) {
            return res.status(400).json({ message: 'Full name must be at least 3 characters' });
        }

        // Email validation - must be a proper email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address (e.g. name@example.com)' });
        }

        // Check if user already exists with this email
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user (password will be hashed by the model pre-save hook)
        // Only 'customer' and 'seller' are self-registerable; 'admin' must be set manually
        const allowedRoles = ['customer', 'seller'];
        const requestedRole = req.body.role && allowedRoles.includes(req.body.role)
            ? req.body.role
            : 'customer';

        const user = new User({
            fullName,
            email: email.toLowerCase(),
            password,
            role: requestedRole
        });

        await user.save();

        // Set session data after registration
        req.session.userId = user._id;
        req.session.userRole = user.role;
        req.session.userName = user.fullName;

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// ============================================================
// LOGIN AN EXISTING USER
// ============================================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate that email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact the administrator.' });
        }

        // Compare entered password with stored hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Set session data after successful login
        req.session.userId = user._id;
        req.session.userRole = user.role;
        req.session.userName = user.fullName;

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isActive: user.isActive !== false
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// ============================================================
// LOGOUT THE CURRENT USER
// ============================================================
exports.logout = (req, res) => {
    // Destroy the session to log out the user
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
};

// ============================================================
// GET CURRENT USER SESSION INFO
// ============================================================
exports.getSession = async (req, res) => {
    if (req.session.userId) {
        const user = await User.findById(req.session.userId).select('isActive');
        if (!user || user.isActive === false) {
            req.session.destroy(() => {});
            return res.status(200).json({ loggedIn: false });
        }

        res.status(200).json({
            loggedIn: true,
            user: {
                id: req.session.userId,
                fullName: req.session.userName,
                role: req.session.userRole
            }
        });
    } else {
        res.status(200).json({ loggedIn: false });
    }
};

// ============================================================
// GET ALL USERS (Admin Only)
// ============================================================
exports.getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.session.userRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Fetch all users, exclude password field
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// ============================================================
// UPDATE USER ACTIVE STATUS (Admin Only)
// ============================================================
exports.updateUserStatus = async (req, res) => {
    try {
        if (req.session.userRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be true or false' });
        }

        if (req.params.id === req.session.userId.toString() && isActive === false) {
            return res.status(400).json({ message: 'You cannot deactivate your own admin account.' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: isActive ? 'User activated successfully' : 'User deactivated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Error updating user status' });
    }
};

// ============================================================
// CREATE USER (Admin Only) - admin can create seller or customer accounts
// ============================================================
exports.adminCreateUser = async (req, res) => {
    try {
        if (req.session.userRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { fullName, email, password, role } = req.body;

        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ message: 'Full name, email, password and role are required' });
        }

        const allowedRoles = ['customer', 'seller'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Role must be customer or seller' });
        }

        if (/[0-9]/.test(fullName) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(fullName)) {
            return res.status(400).json({ message: 'Full name can only contain letters and spaces' });
        }
        if (fullName.trim().length < 3) {
            return res.status(400).json({ message: 'Full name must be at least 3 characters' });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
        }
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one number' });
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*)' });
        }

        const user = new User({
            fullName,
            email: email.toLowerCase(),
            password,
            role
        });
        await user.save();

        res.status(201).json({
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Admin create user error:', error);
        res.status(500).json({ message: 'Server error while creating user' });
    }
};

// ============================================================
// EDIT USER (Admin Only) - update name, email, role, optional password
// ============================================================
exports.adminEditUser = async (req, res) => {
    try {
        if (req.session.userRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { fullName, email, role, password } = req.body;
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent demoting the only admin
        if (user.role === 'admin' && role && role !== 'admin') {
            return res.status(400).json({ message: 'Cannot change role of an admin account' });
        }

        if (fullName !== undefined) {
            if (/[0-9]/.test(fullName) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(fullName)) {
                return res.status(400).json({ message: 'Full name can only contain letters and spaces' });
            }
            if (fullName.trim().length < 3) {
                return res.status(400).json({ message: 'Full name must be at least 3 characters' });
            }
            user.fullName = fullName;
        }

        if (email !== undefined) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Please enter a valid email address' });
            }
            const duplicate = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
            if (duplicate) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
            user.email = email.toLowerCase();
        }

        if (role !== undefined && user.role !== 'admin') {
            const allowedRoles = ['customer', 'seller'];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ message: 'Role must be customer or seller' });
            }
            user.role = role;
        }

        if (password && password.trim() !== '') {
            if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
                !/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                return res.status(400).json({ message: 'New password must be 8+ chars with uppercase, lowercase, number and special character' });
            }
            user.password = password;
        }

        await user.save();

        res.status(200).json({
            message: 'User updated successfully',
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Admin edit user error:', error);
        res.status(500).json({ message: 'Server error while updating user' });
    }
};

// ============================================================
// DELETE USER (Admin Only)
// ============================================================
exports.adminDeleteUser = async (req, res) => {
    try {
        if (req.session.userRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const userId = req.params.id;

        // Prevent self-deletion
        if (userId === req.session.userId.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Admin accounts cannot be deleted from the panel' });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
};

// ============================================================
// FORGOT PASSWORD - Reset password using email and security check
// ============================================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmNewPassword } = req.body;

        // Validate fields
        if (!email || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        // Strong password validation
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        if (!/[A-Z]/.test(newPassword)) {
            return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
        }
        if (!/[a-z]/.test(newPassword)) {
            return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
        }
        if (!/[0-9]/.test(newPassword)) {
            return res.status(400).json({ message: 'Password must contain at least one number' });
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
            return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*)' });
        }
        if (/(.)\1{3,}/.test(newPassword)) {
            return res.status(400).json({ message: 'Password cannot contain 4 or more repeated characters' });
        }
        if (/1234|2345|3456|4567|5678|6789|abcd|bcde|cdef/.test(newPassword.toLowerCase())) {
            return res.status(400).json({ message: 'Password cannot contain sequential characters like 1234 or abcd' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successful! You can now login with your new password.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};
