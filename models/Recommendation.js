/**
 * Recommendation Model
 * 
 * Stores the recommendation history for each user.
 * Tracks what preferences were submitted and which phones were recommended.
 */

const mongoose = require('mongoose');

// Define the Recommendation schema
const recommendationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    preferences: {
        budget: {
            type: String,
            required: true
        },
        brand: {
            type: String,
            required: true
        },
        usage: {
            type: [String],
            required: true
        },
        features: {
            type: [String],
            required: true
        }
    },
    recommendedPhones: [{
        phone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Phone'
        },
        score: {
            type: Number
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the Recommendation model
module.exports = mongoose.model('Recommendation', recommendationSchema);
