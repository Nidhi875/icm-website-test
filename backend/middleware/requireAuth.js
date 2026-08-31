const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
        return res.status(401).json({
            message: "Sign in is required."
        });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);

        req.user = user;

        next();
    } catch {
        return res.status(401).json({
            message: "Your sign-in has expired."
        });
    }
};