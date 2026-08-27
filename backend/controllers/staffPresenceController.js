const pool = require("../config/db");

const ONLINE_THRESHOLD_SECONDS = 120;


// ==========================================================
// STAFF HEARTBEAT
// ==========================================================

exports.heartbeat = async (req, res) => {

    try {

        const { staffId } = req.body;

        if (!staffId) {
            return res.status(400).json({
                success: false,
                message: "staffId is required"
            });
        }

        await pool.query(
            `
            INSERT INTO staff_presence (staff_id, last_seen)
            VALUES ($1, NOW())

            ON CONFLICT (staff_id)
            DO UPDATE SET last_seen = NOW()
            `,
            [staffId]
        );

        res.json({
            success: true
        });

    } catch (error) {

        console.error("STAFF PRESENCE HEARTBEAT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update staff presence"
        });

    }
};


// ==========================================================
// GET STAFF PRESENCE
// ==========================================================

exports.getPresence = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT COUNT(*) AS online
            FROM staff_presence
            WHERE last_seen > NOW() - INTERVAL '${ONLINE_THRESHOLD_SECONDS} seconds'
            `
        );

        const online = Number(result.rows[0].online);

        res.json({
            success: true,
            online
        });

    } catch (error) {

        console.error("GET STAFF PRESENCE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get staff presence"
        });

    }
};