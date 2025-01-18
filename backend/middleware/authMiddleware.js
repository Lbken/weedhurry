const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Add detailed logging
    console.log('Auth Middleware Debug:', {
        cookies: req.cookies,
        headers: req.headers,
        method: req.method,
        path: req.path
    });

    const token = req.cookies.accessToken;

    if (!token) {
        console.log('No token found in request');
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', { vendorId: decoded.id });
        req.vendorId = decoded.id;
        next();
    } catch (error) {
        console.error('Token verification failed:', {
            error: error.message,
            token: token.substring(0, 10) + '...' // Log first 10 chars of token for debugging
        });
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;