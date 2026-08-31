const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");

/* ==========================================================
   LOGIN — checks the real staff table, issues a JWT.
   ========================================================== */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM staff WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("STAFF LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

/* ==========================================================
   LIST STAFF — Admin only. Name, email, phone, role only —
   password_hash is never selected or sent back.
   ========================================================== */
exports.listStaff = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role, created_at FROM staff ORDER BY id ASC"
    );
    res.json({ success: true, staff: result.rows });
  } catch (error) {
    console.error("LIST STAFF ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to load staff" });
  }
};

/* ==========================================================
   ADD STAFF — Admin only.
   Body: { name, email, phone, role }
   No password is typed by the admin — a secure temporary one
   is generated automatically and returned ONCE in the response
   so it can be shared with the new staff member. It is never
   stored anywhere in plain text, and never shown again after this.
   ========================================================== */
exports.addStaff = async (req, res) => {
  const { name, email, phone, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: "Name, email, and role are required" });
  }

  if (!["Administrator", "Team Member"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  try {
    const tempPassword = crypto.randomBytes(9).toString("base64url"); // e.g. "kQ8f3ZpN2mXa"
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await pool.query(
      `INSERT INTO staff (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at`,
      [name, email.toLowerCase(), phone || null, passwordHash, role]
    );

    res.status(201).json({
      success: true,
      staff: result.rows[0],
      temporaryPassword: tempPassword, // shown once, not stored anywhere as plain text
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "A staff member with this email already exists" });
    }
    console.error("ADD STAFF ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to add staff member" });
  }
};

/* ==========================================================
   UPDATE STAFF — Admin only. Change name, phone, and/or role.
   Body: { name, phone, role }
   ========================================================== */
exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, phone, role } = req.body;

  if (!["Administrator", "Team Member"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  try {
    const result = await pool.query(
      `UPDATE staff SET name = $1, phone = $2, role = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, email, phone, role, created_at`,
      [name, phone || null, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    res.json({ success: true, staff: result.rows[0] });
  } catch (error) {
    console.error("UPDATE STAFF ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update staff member" });
  }
};

/* ==========================================================
   DELETE STAFF — Admin only.
   ========================================================== */
exports.deleteStaff = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM staff WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE STAFF ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete staff member" });
  }
};