const jwt = require("jsonwebtoken");

// Checks for a valid "Authorization: Bearer <token>" header.
// If valid, attaches the logged-in user's info to req.user.
// If missing/invalid, stops the request with a 401.

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
        return res.status(401).json({ success: false, message: "Sign in is required." });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch {
        res.status(401).json({ success: false, message: "Your sign-in has expired. Please log in again." });
    }
};