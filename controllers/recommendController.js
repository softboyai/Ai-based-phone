/**
 * Recommendation Controller
 * 
 * Contains the AI-based recommendation logic.
 * Uses a rule-based scoring system to match phones to user preferences.
 * Each phone is scored out of 100 points based on:
 * - Budget Match (30 points)
 * - Brand Match (20 points)
 * - Usage Match (30 points)
 * - Feature Match (20 points)
 */

const Phone = require('../models/Phone');
const Recommendation = require('../models/Recommendation');

// ============================================================
// BUDGET RANGES (in RWF)
// ============================================================
const BUDGET_RANGES = {
    'under-50000': { min: 0, max: 50000 },
    '50000-150000': { min: 50000, max: 150000 },
    '150000-300000': { min: 150000, max: 300000 },
    'above-300000': { min: 300000, max: Infinity }
};

// ============================================================
// AI SCORING FUNCTION
// ============================================================
function calculateScore(phone, preferences) {
    let score = 0;

    // --- BUDGET MATCH (30 points) ---
    const budgetRange = BUDGET_RANGES[preferences.budget];
    if (budgetRange) {
        if (phone.price >= budgetRange.min && phone.price <= budgetRange.max) {
            // Phone price falls within selected budget range = 30 points
            score += 30;
        } else if (phone.price > budgetRange.max && phone.price <= budgetRange.max * 1.3) {
            // Phone price is slightly above range (within 30% over) = 10 points
            score += 10;
        }
        // Phone price is way above range = 0 points
    }

    // --- BRAND MATCH (20 points) ---
    if (preferences.brand === 'any' || preferences.brand === 'Any') {
        // Customer selected "Any" = 20 points for all phones
        score += 20;
    } else if (phone.brand.toLowerCase() === preferences.brand.toLowerCase()) {
        // Phone brand matches selected brand = 20 points
        score += 20;
    }
    // Phone brand does not match = 0 points

    // --- USAGE MATCH (30 points) ---
    // For each customer usage type that matches phone usageType array:
    // add 10 points (max 30 points)
    let usagePoints = 0;
    if (preferences.usage && preferences.usage.length > 0) {
        preferences.usage.forEach(usage => {
            if (phone.usageType.includes(usage.toLowerCase())) {
                usagePoints += 10;
            }
        });
    }
    score += Math.min(usagePoints, 30); // Cap at 30 points

    // --- FEATURE MATCH (20 points) ---
    if (preferences.features && preferences.features.length > 0) {
        preferences.features.forEach(feature => {
            switch (feature.toLowerCase()) {
                case 'long battery':
                    // Long battery: phone battery >= 4500mAh = 5 points
                    if (phone.battery >= 4500) score += 5;
                    break;
                case 'high storage':
                    // High storage: phone storage >= 128GB = 5 points
                    if (phone.storage >= 128) score += 5;
                    break;
                case 'good camera':
                    // Good camera: phone camera >= 48MP = 5 points
                    if (phone.camera >= 48) score += 5;
                    break;
                case 'large ram':
                    // Large RAM: phone RAM >= 6GB = 5 points
                    if (phone.ram >= 6) score += 5;
                    break;
                case 'slim design':
                    // Slim design: give 5 points (all phones considered slim for simplicity)
                    score += 5;
                    break;
            }
        });
    }

    return score;
}

// ============================================================
// GET RECOMMENDATIONS
// ============================================================
exports.getRecommendations = async (req, res) => {
    try {
        const { budget, brand, usage, features } = req.body;

        // Validate input
        if (!budget || !brand) {
            return res.status(400).json({ message: 'Budget and brand preferences are required' });
        }

        // Fetch all phones that are in stock
        const phones = await Phone.find({ inStock: true });

        if (phones.length === 0) {
            return res.status(404).json({ message: 'No phones available in stock' });
        }

        // Build preferences object
        const preferences = {
            budget,
            brand,
            usage: usage || [],
            features: features || []
        };

        // Score each phone using the AI scoring algorithm
        const scoredPhones = phones.map(phone => ({
            phone,
            score: calculateScore(phone, preferences)
        }));

        // Sort phones by score in descending order
        scoredPhones.sort((a, b) => b.score - a.score);

        // Get top 3 recommended phones
        const top3 = scoredPhones.slice(0, 3);

        // Save recommendation to database if user is logged in
        if (req.session.userId) {
            const recommendation = new Recommendation({
                userId: req.session.userId,
                preferences,
                recommendedPhones: top3.map(item => ({
                    phone: item.phone._id,
                    score: item.score
                }))
            });
            await recommendation.save();
        }

        // Return top 3 phones with their match percentage
        const results = top3.map(item => ({
            phone: item.phone,
            matchPercentage: item.score
        }));

        res.status(200).json({
            message: 'Recommendations generated successfully',
            recommendations: results
        });

    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ message: 'Error generating recommendations' });
    }
};

// ============================================================
// GET RECOMMENDATION HISTORY FOR A USER
// ============================================================
exports.getHistory = async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Please login to view history' });
        }

        // Fetch all recommendations for this user, populate phone details
        const history = await Recommendation.find({ userId: req.session.userId })
            .populate('recommendedPhones.phone')
            .sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ message: 'Error fetching recommendation history' });
    }
};

// ============================================================
// GET ALL RECOMMENDATIONS (Admin Only)
// ============================================================
exports.getAllRecommendations = async (req, res) => {
    try {
        const recommendations = await Recommendation.find()
            .populate('userId', 'fullName email')
            .populate('recommendedPhones.phone')
            .sort({ createdAt: -1 });

        res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error fetching all recommendations:', error);
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
};
