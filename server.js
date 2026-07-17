/**
 * KT Phones - AI-Based Mobile Phone Recommendation System
 * Main Server File
 * 
 * This file sets up the Express server, connects to MongoDB,
 * configures middleware, and registers all routes.
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const { exec } = require('child_process');

// Import route files
const authRoutes = require('./routes/auth');
const phoneRoutes = require('./routes/phones');
const recommendRoutes = require('./routes/recommend');
const reportRoutes = require('./routes/report');

// Create Express application
const app = express();

// Get port and MongoDB URI from environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ktphones';

// ============================================================
// MIDDLEWARE CONFIGURATION
// ============================================================

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images from the images folder
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Configure session middleware for user authentication
app.use(session({
    secret: process.env.SESSION_SECRET || 'kt-phones-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // Session expires after 24 hours
    }
}));

// ============================================================
// ROUTE REGISTRATION
// ============================================================

// Authentication routes (login, register, logout)
app.use('/api/auth', authRoutes);

// Phone management routes (CRUD operations)
app.use('/api/phones', phoneRoutes);

// Recommendation routes (AI-based phone recommendations)
app.use('/api/recommend', recommendRoutes);

// Report routes (PDF generation with PDFKit)
app.use('/api/report', reportRoutes);

// ============================================================
// HTML PAGE ROUTES
// ============================================================

// Serve HTML pages from the views folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/recommend', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'recommend.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'results.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/seller', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'seller.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'forgot-password.html'));
});

// ============================================================
// DATABASE CONNECTION AND SERVER START
// ============================================================

// Global error handler for multer and other errors
app.use((err, req, res, next) => {
    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ message: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB' });
    }
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Connect to MongoDB database
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully');
        
        // Start the server after successful database connection
        app.listen(PORT, () => {
            console.log(`🚀 KT Phones server running at http://localhost:${PORT}`);
            console.log(`📱 Open your browser and visit: http://localhost:${PORT}`);
            
            // Auto-open browser on Windows
            exec(`start http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('Make sure MongoDB is running on your computer.');
        process.exit(1);
    });
