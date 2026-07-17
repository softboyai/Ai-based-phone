/**
 * Auth Middleware
 *
 * Shared role-based access control helpers used across routes.
 */

/** Allow only admins */
function isAdmin(req, res, next) {
    if (req.session.userRole === 'admin') return next();
    res.status(403).json({ message: 'Access denied. Admins only.' });
}

/** Allow only sellers */
function isSeller(req, res, next) {
    if (req.session.userRole === 'seller') return next();
    res.status(403).json({ message: 'Access denied. Sellers only.' });
}

/** Allow admins OR sellers */
function isAdminOrSeller(req, res, next) {
    if (req.session.userRole === 'admin' || req.session.userRole === 'seller') return next();
    res.status(403).json({ message: 'Access denied. Admins and sellers only.' });
}

/** Require any authenticated user */
function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    res.status(401).json({ message: 'Please login to continue.' });
}

module.exports = { isAdmin, isSeller, isAdminOrSeller, isAuthenticated };
