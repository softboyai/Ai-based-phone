/**
 * User Model
 * 
 * Defines the schema for users in the system.
 * Users can be either 'admin' or 'customer'.
 * Passwords are hashed using bcrypt before saving.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['admin', 'seller', 'customer'],
        default: 'customer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password in database
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
