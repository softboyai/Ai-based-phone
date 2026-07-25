/**
 * Authentication Routes
 * 
 * Handles all authentication-related API endpoints:
 * - POST /api/auth/register - Register a new user
 * - POST /api/auth/login - Login an existing user
 * - GET /api/auth/logout - Logout the current user
 * - GET /api/auth/session - Get current session info
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register a new user
router.post('/register', authController.register);

// Login an existing user
router.post('/login', authController.login);

// Logout the current user
router.get('/logout', authController.logout);

// Get current session information
router.get('/session', authController.getSession);

// Get all users (admin only)
router.get('/users', authController.getAllUsers);

// Admin: create a new seller or customer account
router.post('/users', authController.adminCreateUser);

// Activate or deactivate a user — must be before generic /:id to avoid shadowing
router.put('/users/:id/status', authController.updateUserStatus);

// Admin: edit user (name, email, role, password)
router.put('/users/:id', authController.adminEditUser);

// Admin: delete user
router.delete('/users/:id', authController.adminDeleteUser);

// Forgot password - reset password
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;
