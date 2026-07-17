/**
 * Phone Model
 * 
 * Defines the schema for mobile phones in the system.
 * Each phone has specifications used by the AI recommendation engine.
 */

const mongoose = require('mongoose');

// Define the Phone schema
const phoneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Phone name is required'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    ram: {
        type: Number,
        required: [true, 'RAM is required'],
        min: [1, 'RAM must be at least 1 GB']
    },
    storage: {
        type: Number,
        required: [true, 'Storage is required'],
        min: [8, 'Storage must be at least 8 GB']
    },
    battery: {
        type: Number,
        required: [true, 'Battery capacity is required'],
        min: [1000, 'Battery must be at least 1000 mAh']
    },
    camera: {
        type: Number,
        required: [true, 'Camera MP is required'],
        min: [2, 'Camera must be at least 2 MP']
    },
    usageType: {
        type: [String],
        required: [true, 'At least one usage type is required'],
        enum: ['gaming', 'photography', 'business', 'everyday', 'social media']
    },
    inStock: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: 'default-phone.svg'
    },
    description: {
        type: String,
        default: ''
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Create and export the Phone model
module.exports = mongoose.model('Phone', phoneSchema);
