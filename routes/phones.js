/**
 * Phone Routes
 *
 * - GET  /api/phones          - Get all phones (public)
 * - GET  /api/phones/featured - Get featured phones (public)
 * - GET  /api/phones/:id      - Get single phone (public)
 * - POST /api/phones          - Add a phone (admin or seller)
 * - PUT  /api/phones/:id      - Update a phone (admin or owner seller)
 * - DELETE /api/phones/:id    - Delete a phone (admin or owner seller)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const phoneController = require('../controllers/phoneController');
const { isAdmin, isAdminOrSeller } = require('../middleware/auth');

// ============================================================
// MULTER CONFIGURATION FOR IMAGE UPLOADS
// ============================================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'images'));
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

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
// ROUTES
// ============================================================

// Public routes
router.get('/', phoneController.getAllPhones);
router.get('/featured', phoneController.getFeaturedPhones);
router.get('/my-listings', isAdminOrSeller, phoneController.getMyPhones);
router.get('/:id', phoneController.getPhoneById);

// Admin or Seller: add phone
router.post('/', isAdminOrSeller, upload.single('image'), (req, res, next) => {    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
    }
    next();
}, phoneController.addPhone);

// Admin or Seller (own phone): update phone
router.put('/:id', isAdminOrSeller, upload.single('image'), (req, res, next) => {
    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
    }
    next();
}, phoneController.updatePhone);

// Admin or Seller (own phone): delete phone
router.delete('/:id', isAdminOrSeller, phoneController.deletePhone);

module.exports = router;
