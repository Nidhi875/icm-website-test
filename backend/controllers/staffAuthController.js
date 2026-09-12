const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================================
// SETUP: make sure the "staff" table exists, and that the
// original 7 hardcoded accounts exist as real rows.
// This runs safely every time — it never overwrites existing
// data (ON CONFLICT DO NOTHING), it only creates what's missing.
// ==========================================================

async function ensureStaffTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS staff (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            department TEXT,
            bio TEXT,
            role TEXT NOT NULL DEFAULT 'Team Member',
            profile_image TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

    // Add password column to older staff tables if it is missing.
    await pool.query(`
        ALTER TABLE staff
        ADD COLUMN IF NOT EXISTS password TEXT
    `);
}

async function seedStaffTable() {
    // Same accounts / same password that used to be hardcoded in this file.
    // This only inserts them the FIRST time — if they already exist
    // (e.g. because a real signup/admin flow created them later),
    // nothing here will touch or overwrite them.
    const defaultPasswordHash = await bcrypt.hash("DistanceAdmin2026@Gouldings", 10);

    await pool.query(
    `UPDATE staff
     SET password = $1
     WHERE password IS NULL`,
    [defaultPasswordHash]
);

    const seedUsers = [
        { name: "Administrator", email: "derrick.mason@gouldings.education", role: "Administrator" },
        { name: "Claire", email: "claire@gouldings.education", role: "Administrator" },
        { name: "jOY banerjee", email: "joy@gouldings.education", role: "Team Member" },
        { name: "Prathistha", email: "prathistha@gouldings.education", role: "Team Member" },
        { name: "DP", email: "dp@gouldings.education", role: "Team Member" },
        { name: "Arnab", email: "arnab@gouldings.education", role: "Team Member" },
        { name: "Nidhi", email: "nidhi@gouldings.education", role: "Team Member" },
    ];

    for (const u of seedUsers) {
        await pool.query(
            `INSERT INTO staff (name, email, password, role)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO NOTHING`,
            [u.name, u.email, defaultPasswordHash, u.role]
        );
    }
}

async function ensureReady() {
    await ensureStaffTable();
    await seedStaffTable();
}

// ==========================================================
// LOGIN
// ==========================================================

exports.login = async (req, res) => {
    try {
        await ensureReady();

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
        const match = await bcrypt.compare(password, user.password);

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
        await ensureReady();

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
        await ensureReady();

        const {
            name,
            phone,
            department,
            bio,
            role,
            profileImage
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Full name is required"
            });
        }

        const allowedRoles = [
            "Administrator",
            "Team Member"
        ];

        if (!role || !allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const result = await pool.query(
            `UPDATE staff
             SET name = $1,
                 phone = $2,
                 department = $3,
                 bio = $4,
                 role = $5,
                 profile_image = COALESCE($6, profile_image),
                 updated_at = NOW()
             WHERE id = $7
             RETURNING id, name, email, phone, department, bio, role, profile_image`,
            [
                name.trim(),
                phone || null,
                department || null,
                bio || null,
                role,
                profileImage || null,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Staff account not found"
            });
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

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ==========================================================
// CHANGE PASSWORD  (requires requireStaffAuth middleware first)
// ==========================================================

exports.changePassword = async (req, res) => {
    try {
        await ensureReady();

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
        const match = await bcrypt.compare(currentPassword, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        await pool.query(
            "UPDATE staff SET password = $1, updated_at = NOW() WHERE id = $2",
            [newHash, req.user.id]
        );

        res.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};