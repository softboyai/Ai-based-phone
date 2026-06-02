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

// Forgot password - reset password
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;
