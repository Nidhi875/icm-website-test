const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================================
// SETUP
// Your "staff" table already exists with real accounts and
// real hashed passwords in "password_hash" — we never touch
// or re-seed that. We ONLY add a few extra optional columns
// needed for the profile page (department, bio, profile
// image), and only if they don't already exist. This cannot
// affect your existing 5 accounts or their passwords.
// ==========================================================

async function ensureProfileColumns() {
    await pool.query(`
        ALTER TABLE staff
        ADD COLUMN IF NOT EXISTS department TEXT,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS profile_image TEXT
    `);
}

// ==========================================================
// LOGIN
// ==========================================================

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const result = await pool.query(
            "SELECT * FROM staff WHERE LOWER(email) = LOWER($1)",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                department: user.department,
                bio: user.bio,
                profileImage: user.profile_image
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ==========================================================
// GET PROFILE  (requires requireStaffAuth middleware first)
// ==========================================================

exports.getProfile = async (req, res) => {
    try {
        await ensureProfileColumns();

        const result = await pool.query(
            `SELECT id, name, email, phone, department, bio, role, profile_image
             FROM staff WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Staff account not found" });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                department: user.department,
                bio: user.bio,
                role: user.role,
                profileImage: user.profile_image
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ==========================================================
// UPDATE PROFILE  (requires requireStaffAuth middleware first)
// ==========================================================

exports.updateProfile = async (req, res) => {
    try {
        await ensureProfileColumns();

        const { name, phone, department, bio, profileImage } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Full name is required" });
        }

        const result = await pool.query(
            `UPDATE staff
             SET name = $1,
                 phone = $2,
                 department = $3,
                 bio = $4,
                 profile_image = COALESCE($5, profile_image),
                 updated_at = NOW()
             WHERE id = $7
             RETURNING id, name, email, phone, department, bio, role, profile_image`,
            [
                name.trim(),
                phone || null,
                department || null,
                bio || null,
                profileImage || null,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Staff account not found" });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                department: user.department,
                bio: user.bio,
                role: user.role,
                profileImage: user.profile_image
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ==========================================================
// CHANGE PASSWORD  (requires requireStaffAuth middleware first)
// ==========================================================

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All password fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "New password and confirmation do not match" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
        }

        const result = await pool.query("SELECT * FROM staff WHERE id = $1", [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Staff account not found" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(currentPassword, user.password_hash);

        if (!match) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        await pool.query(
            "UPDATE staff SET password_hash = $1, updated_at = NOW() WHERE id = $2",
            [newHash, req.user.id]
        );

        res.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ==========================================================
// LIST STAFF
// ==========================================================

exports.listStaff = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                name,
                email,
                phone,
                role
            FROM staff
            ORDER BY name ASC
        `);

        res.json({
            success: true,
            staff: result.rows
        });

    } catch (error) {
        console.error("LIST STAFF ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load staff"
        });
    }
};