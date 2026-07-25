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
function calculateRecommendation(phone, preferences) {
    let score = 0;
    const breakdown = [];

    // --- BUDGET MATCH (30 points) ---
    const budgetRange = BUDGET_RANGES[preferences.budget];
    if (budgetRange) {
        if (phone.price >= budgetRange.min && phone.price <= budgetRange.max) {
            // Phone price falls within selected budget range = 30 points
            score += 30;
            breakdown.push({ label: 'Budget match', points: 30, reason: 'Price is inside the customer budget range.' });
        } else if (phone.price > budgetRange.max && phone.price <= budgetRange.max * 1.3) {
            // Phone price is slightly above range (within 30% over) = 10 points
            score += 10;
            breakdown.push({ label: 'Near budget', points: 10, reason: 'Price is slightly above the selected budget but still close.' });
        } else {
            breakdown.push({ label: 'Budget match', points: 0, reason: 'Price is outside the selected budget range.' });
        }
        // Phone price is way above range = 0 points
    }

    // --- BRAND MATCH (20 points) ---
    if (preferences.brand === 'any' || preferences.brand === 'Any') {
        // Customer selected "Any" = 20 points for all phones
        score += 20;
        breakdown.push({ label: 'Brand flexibility', points: 20, reason: 'Customer accepts any brand.' });
    } else if (phone.brand.toLowerCase() === preferences.brand.toLowerCase()) {
        // Phone brand matches selected brand = 20 points
        score += 20;
        breakdown.push({ label: 'Brand match', points: 20, reason: `${phone.brand} matches the requested brand.` });
    } else {
        breakdown.push({ label: 'Brand match', points: 0, reason: `${phone.brand} is different from the requested brand.` });
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
    usagePoints = Math.min(usagePoints, 30);
    score += usagePoints; // Cap at 30 points
    breakdown.push({
        label: 'Usage match',
        points: usagePoints,
        reason: usagePoints > 0
            ? `Matches ${usagePoints / 10} selected usage need(s).`
            : 'No selected usage needs matched this phone.'
    });

    // --- FEATURE MATCH (20 points) ---
    if (preferences.features && preferences.features.length > 0) {
        let featurePoints = 0;
        preferences.features.forEach(feature => {
            switch (feature.toLowerCase()) {
                case 'long battery':
                    // Long battery: phone battery >= 4500mAh = 5 points
                    if (phone.battery >= 4500) featurePoints += 5;
                    break;
                case 'high storage':
                    // High storage: phone storage >= 128GB = 5 points
                    if (phone.storage >= 128) featurePoints += 5;
                    break;
                case 'good camera':
                    // Good camera: phone camera >= 48MP = 5 points
                    if (phone.camera >= 48) featurePoints += 5;
                    break;
                case 'large ram':
                    // Large RAM: phone RAM >= 6GB = 5 points
                    if (phone.ram >= 6) featurePoints += 5;
                    break;
                case 'slim design':
                    // Slim design: give 5 points (all phones considered slim for simplicity)
                    featurePoints += 5;
                    break;
            }
        });
        score += featurePoints;
        breakdown.push({
            label: 'Feature match',
            points: featurePoints,
            reason: featurePoints > 0
                ? 'Selected hardware preferences were found in this phone.'
                : 'Selected hardware preferences were not strongly matched.'
        });
    } else {
        breakdown.push({ label: 'Feature match', points: 0, reason: 'No extra feature preferences were selected.' });
    }

    const reasons = breakdown
        .filter(item => item.points > 0)
        .sort((a, b) => b.points - a.points)
        .slice(0, 3)
        .map(item => item.reason);

    return { score, breakdown, reasons };
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
        const scoredPhones = phones.map(phone => {
            const ai = calculateRecommendation(phone, preferences);
            return {
                phone,
                score: ai.score,
                explanation: ai
            };
        });

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
                    score: item.score,
                    reasons: item.explanation.reasons,
                    breakdown: item.explanation.breakdown
                }))
            });
            await recommendation.save();
        }

        // Return top 3 phones with their match percentage
        const results = top3.map(item => ({
            phone: item.phone,
            matchPercentage: item.score,
            reasons: item.explanation.reasons,
            breakdown: item.explanation.breakdown
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
