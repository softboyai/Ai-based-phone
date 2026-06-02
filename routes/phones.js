/**
 * Phone Routes
 * 
 * Handles all phone-related API endpoints:
 * - GET /api/phones - Get all phones (public)
 * - GET /api/phones/:id - Get a single phone (public)
 * - POST /api/phones - Add a new phone (admin only)
 * - PUT /api/phones/:id - Update a phone (admin only)
 * - DELETE /api/phones/:id - Delete a phone (admin only)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const phoneController = require('../controllers/phoneController');

// ============================================================
// MULTER CONFIGURATION FOR IMAGE UPLOADS
// ============================================================
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'images'));
    },
    filename: function(req, file, cb) {
        // Create unique filename with timestamp
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

// File filter to only accept image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

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

// Get all phones (public access)
router.get('/', phoneController.getAllPhones);

// Get featured phones (public access)
router.get('/featured', phoneController.getFeaturedPhones);

// Get a single phone by ID (public access)
router.get('/:id', phoneController.getPhoneById);

// Add a new phone (admin only, with image upload)
router.post('/', isAdmin, upload.single('image'), (req, res, next) => {
    // Handle multer errors
    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
    }
    next();
}, phoneController.addPhone);

// Update a phone (admin only, with optional image upload)
router.put('/:id', isAdmin, upload.single('image'), (req, res, next) => {
    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
    }
    next();
}, phoneController.updatePhone);

// Delete a phone (admin only)
router.delete('/:id', isAdmin, phoneController.deletePhone);

module.exports = router;
