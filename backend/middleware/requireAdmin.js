const jwt = require("jsonwebtoken");

// Same pattern as requireGoalsEditor.js, but reusable for any
// admin-only action (staff management, etc.) instead of just goals.
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Sign in is required." });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (user.role !== "Administrator") {
      return res.status(403).json({ message: "Only administrators can do this." });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Your sign-in has expired." });
  }
};