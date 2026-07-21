/**
 * Database Seed Script
 *
 * This script populates the MongoDB database with:
 * - 10 sample phones with realistic specifications
 * - 1 default admin account  (admin@ktphones.com  / KtPh0n3s@2024)
 * - 1 sample seller account  (seller@ktphones.com / KtSell3r@2024)
 *
 * Run this script with: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Phone = require('./models/Phone');
const User = require('./models/User');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ktphones';

// ============================================================
// SAMPLE PHONE DATA
// ============================================================
const phones = [
    {
        name: 'Samsung Galaxy A15',
        brand: 'Samsung',
        price: 89000,
        ram: 4,
        storage: 128,
        battery: 5000,
        camera: 50,
        usageType: ['everyday', 'social media'],
        inStock: true,
        featured: false,
        image: 'samsung-a15.jpg',
        description: 'Affordable Samsung phone with a large display, long-lasting battery, and decent camera for everyday use.'
    },
    {
        name: 'Samsung Galaxy A55',
        brand: 'Samsung',
        price: 230000,
        ram: 8,
        storage: 128,
        battery: 5000,
        camera: 50,
        usageType: ['photography', 'everyday', 'social media'],
        inStock: true,
        featured: true,
        image: 'samsung-a55.jpg',
        description: 'Mid-range Samsung with excellent camera, smooth performance, and water resistance for daily use.'
    },
    {
        name: 'iPhone 14',
        brand: 'iPhone',
        price: 850000,
        ram: 6,
        storage: 128,
        battery: 3279,
        camera: 48,
        usageType: ['photography', 'business', 'social media'],
        inStock: true,
        featured: true,
        image: 'iphone-14.jpg',
        description: 'Premium Apple smartphone with powerful A15 chip, excellent camera system, and seamless iOS experience.'
    },
    {
        name: 'Tecno Spark 20',
        brand: 'Tecno',
        price: 65000,
        ram: 4,
        storage: 128,
        battery: 5000,
        camera: 32,
        usageType: ['everyday', 'social media'],
        inStock: true,
        featured: false,
        image: 'tecno-spark20.jpg',
        description: 'Budget-friendly Tecno phone with large battery, decent storage, and good selfie camera.'
    },
    {
        name: 'Tecno Camon 30',
        brand: 'Tecno',
        price: 180000,
        ram: 8,
        storage: 256,
        battery: 5000,
        camera: 64,
        usageType: ['photography', 'social media', 'everyday'],
        inStock: true,
        featured: true,
        image: 'tecno-camon30.jpg',
        description: 'Camera-focused Tecno phone with 64MP sensor, large storage, and all-day battery life.'
    },
    {
        name: 'Infinix Hot 40',
        brand: 'Infinix',
        price: 75000,
        ram: 4,
        storage: 128,
        battery: 5000,
        camera: 48,
        usageType: ['everyday', 'gaming', 'social media'],
        inStock: true,
        featured: false,
        image: 'infinix-hot40.jpg',
        description: 'Affordable Infinix with gaming capabilities, large battery, and good camera for the price.'
    },
    {
        name: 'Infinix Note 40',
        brand: 'Infinix',
        price: 160000,
        ram: 8,
        storage: 256,
        battery: 5000,
        camera: 108,
        usageType: ['photography', 'gaming', 'everyday', 'social media'],
        inStock: true,
        featured: true,
        image: 'infinix-note40.jpg',
        description: 'Feature-packed Infinix with 108MP camera, fast charging, and powerful processor for gaming.'
    },
    {
        name: 'Nokia G42',
        brand: 'Nokia',
        price: 95000,
        ram: 4,
        storage: 128,
        battery: 5000,
        camera: 50,
        usageType: ['business', 'everyday'],
        inStock: true,
        featured: false,
        image: 'nokia-g42.jpg',
        description: 'Reliable Nokia phone with clean Android experience, 5G connectivity, and durable build quality.'
    },
    {
        name: 'Samsung Galaxy S23',
        brand: 'Samsung',
        price: 650000,
        ram: 8,
        storage: 256,
        battery: 3900,
        camera: 50,
        usageType: ['photography', 'gaming', 'business', 'social media'],
        inStock: true,
        featured: true,
        image: 'samsung-s23.jpg',
        description: 'Flagship Samsung with top-tier performance, pro-grade camera, and premium design for power users.'
    },
    {
        name: 'Tecno Phantom V Fold',
        brand: 'Tecno',
        price: 420000,
        ram: 12,
        storage: 256,
        battery: 5000,
        camera: 50,
        usageType: ['business', 'photography', 'gaming', 'everyday'],
        inStock: true,
        featured: true,
        image: 'tecno-phantom.jpg',
        description: 'Innovative foldable phone from Tecno with large inner display, multitasking capabilities, and flagship specs.'
    }
];

// ============================================================
// DEFAULT ADMIN ACCOUNT
// ============================================================
const adminUser = {
    fullName: 'Jean Pierre Habimana',
    email: 'admin@ktphones.com',
    password: 'KtPh0n3s@2024',
    role: 'admin'
};

// ============================================================
// SAMPLE SELLER ACCOUNT (KT Phones staff member)
// ============================================================
const sellerUser = {
    fullName: 'Alice Uwimana',
    email: 'seller@ktphones.com',
    password: 'KtSell3r@2024',
    role: 'seller'
};

// ============================================================
// SEED FUNCTION
// ============================================================
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Phone.deleteMany({});
        await User.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert phones
        await Phone.insertMany(phones);
        console.log(`📱 Added ${phones.length} phones to the database`);

        // Create admin user (password hashed by model pre-save hook)
        const admin = new User(adminUser);
        await admin.save();
        console.log('👤 Created admin account:');
        console.log('   Email:    admin@ktphones.com');
        console.log('   Password: KtPh0n3s@2024');

        // Create sample seller (KT Phones staff member)
        const seller = new User(sellerUser);
        await seller.save();
        console.log('🛒 Created seller account (KT Phones staff):');
        console.log('   Email:    seller@ktphones.com');
        console.log('   Password: KtSell3r@2024');

        console.log('\n✅ Database seeded successfully!');
        console.log('🚀 You can now start the server with: node server.js');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase();
