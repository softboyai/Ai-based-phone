/**
 * Recommendation Routes
 * 
 * Handles all recommendation-related API endpoints:
 * - POST /api/recommend - Submit preferences and get recommendations
 * - GET /api/recommend/history - Get recommendation history for logged-in user
 * - GET /api/recommend/all - Get all recommendations (admin only)
 */

const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

// ============================================================
// MIDDLEWARE: Check if user is logged in
// ============================================================
function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Please login to access this feature' });
    }
}

// ============================================================
// MIDDLEWARE: Check if user is admin
// ============================================================
function isAdmin(req, res, next) {
    if (req.session.userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
}

// ============================================================
// ROUTES
// ============================================================

// Submit preferences and get AI recommendations (must be logged in)
router.post('/', isLoggedIn, recommendController.getRecommendations);

// Get recommendation history for the logged-in user
router.get('/history', isLoggedIn, recommendController.getHistory);

// Get all recommendations (admin only)
router.get('/all', isAdmin, recommendController.getAllRecommendations);

module.exports = router;
