const pool = require("../config/db");

/* ==========================================================
   HELPER — format minutes as "8h 15m"
   ========================================================== */
function formatHours(minutes) {
    if (!minutes || minutes <= 0) return "0h";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) return `${hours}h`;

    return `${hours}h ${mins}m`;
}


/* ==========================================================
   START / RECORD ATTENDANCE
   Called when staff logs in.
   ========================================================== */

exports.loginAttendance = async (req, res) => {

    const { staffId } = req.body;

    if (!staffId) {
        return res.status(400).json({
            success: false,
            message: "staffId is required"
        });
    }

    try {

        const result = await pool.query(
            `
            INSERT INTO attendance (
                staff_id,
                attendance_date,
                login_time,
                last_seen,
                status,
                is_late
            )
            VALUES (
                $1,
                CURRENT_DATE,
                NOW(),
                NOW(),
                'present',
                CASE
                    WHEN CURRENT_TIME > TIME '09:00:00'
                    THEN TRUE
                    ELSE FALSE
                END
            )
            ON CONFLICT (staff_id, attendance_date)
            DO UPDATE SET
                last_seen = NOW(),
                status = 'present',
                updated_at = NOW()
            RETURNING *
            `,
            [staffId]
        );

        res.json({
            success: true,
            attendance: result.rows[0]
        });

    } catch (error) {

        console.error("LOGIN ATTENDANCE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to record attendance"
        });
    }
};


/* ==========================================================
   HEARTBEAT
   Updates last_seen while staff is using portal.
   ========================================================== */

exports.heartbeat = async (req, res) => {

    const { staffId } = req.body;

    if (!staffId) {
        return res.status(400).json({
            success: false,
            message: "staffId is required"
        });
    }

    try {

        const result = await pool.query(
            `
            UPDATE attendance
            SET
                last_seen = NOW(),
                status = 'present',
                updated_at = NOW()
            WHERE staff_id = $1
            AND attendance_date = CURRENT_DATE
            RETURNING *
            `,
            [staffId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Today's attendance record not found"
            });
        }

        res.json({
            success: true,
            attendance: result.rows[0]
        });

    } catch (error) {

        console.error("ATTENDANCE HEARTBEAT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update attendance"
        });
    }
};


/* ==========================================================
   LOGOUT
   Records logout time and calculates working minutes.
   ========================================================== */

exports.logoutAttendance = async (req, res) => {

    const { staffId } = req.body;

    if (!staffId) {
        return res.status(400).json({
            success: false,
            message: "staffId is required"
        });
    }

    try {

        const result = await pool.query(
            `
            UPDATE attendance
            SET
                logout_time = NOW(),
                working_minutes =
                    GREATEST(
                        0,
                        FLOOR(
                            EXTRACT(
                                EPOCH FROM (NOW() - login_time)
                            ) / 60
                        )
                    )::INTEGER,
                status = 'offline',
                updated_at = NOW()
            WHERE staff_id = $1
            AND attendance_date = CURRENT_DATE
            RETURNING *
            `,
            [staffId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Today's attendance record not found"
            });
        }

        res.json({
            success: true,
            attendance: result.rows[0]
        });

    } catch (error) {

        console.error("LOGOUT ATTENDANCE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to record logout"
        });
    }
};


/* ==========================================================
   TODAY'S ATTENDANCE
   Admin sees all staff.
   ========================================================== */

exports.getToday = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                s.id AS staff_id,
                s.name,
                s.email,

                a.attendance_date,
                a.login_time,
                a.logout_time,
                a.last_seen,
                a.status,
                a.is_late,
                a.working_minutes

            FROM staff s

            LEFT JOIN attendance a
                ON a.staff_id = s.id
                AND a.attendance_date = CURRENT_DATE

            ORDER BY s.id ASC
            `
        );

        res.json({
            success: true,
            attendance: result.rows.map(row => ({
                ...row,
                hours: formatHours(row.working_minutes)
            }))
        });

    } catch (error) {

        console.error("GET TODAY ATTENDANCE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load today's attendance"
        });
    }
};


/* ==========================================================
   STAFF'S OWN ATTENDANCE
   ========================================================== */

exports.getMyAttendance = async (req, res) => {

    const { staffId } = req.params;

    if (!staffId) {
        return res.status(400).json({
            success: false,
            message: "staffId is required"
        });
    }

    try {

        const result = await pool.query(
            `
            SELECT
                attendance_date,
                login_time,
                logout_time,
                last_seen,
                status,
                is_late,
                working_minutes
            FROM attendance
            WHERE staff_id = $1
            ORDER BY attendance_date DESC
            LIMIT 100
            `,
            [staffId]
        );

        res.json({
            success: true,
            attendance: result.rows.map(row => ({
                ...row,
                hours: formatHours(row.working_minutes)
            }))
        });

    } catch (error) {

        console.error("GET MY ATTENDANCE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load attendance"
        });
    }
};


/* ==========================================================
   WEEKLY ATTENDANCE
   ========================================================== */

exports.getWeekly = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                s.id AS staff_id,
                s.name,

                COUNT(a.id) FILTER (
                    WHERE a.status IN ('present', 'offline')
                ) AS present,

                COUNT(a.id) FILTER (
                    WHERE a.is_late = TRUE
                ) AS late,

                COALESCE(
                    SUM(a.working_minutes),
                    0
                ) AS working_minutes

            FROM staff s

            LEFT JOIN attendance a
                ON a.staff_id = s.id
                AND a.attendance_date >= CURRENT_DATE - INTERVAL '6 days'
                AND a.attendance_date <= CURRENT_DATE

            GROUP BY s.id, s.name

            ORDER BY s.id ASC
            `
        );

        res.json({
            success: true,
            attendance: result.rows.map(row => ({
                ...row,
                present: Number(row.present || 0),
                late: Number(row.late || 0),
                hours: formatHours(Number(row.working_minutes || 0))
            }))
        });

    } catch (error) {

        console.error("GET WEEKLY ATTENDANCE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load weekly attendance"
        });
    }
};


/* ==========================================================
   MONTHLY ATTENDANCE
   ========================================================== */

exports.getMonthly = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                s.id AS staff_id,
                s.name,

                COUNT(a.id) FILTER (
                    WHERE a.status IN ('present', 'offline')
                ) AS present,

                COUNT(a.id) FILTER (
                    WHERE a.is_late = TRUE
                ) AS late,

                COALESCE(
                    SUM(a.working_minutes),
                    0
                ) AS working_minutes

            FROM staff s

            LEFT JOIN attendance a
                ON a.staff_id = s.id
                AND a.attendance_date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
                AND a.attendance_date <= CURRENT_DATE

            GROUP BY s.id, s.name

            ORDER BY s.id ASC
            `
        );

        res.json({
            success: true,
            attendance: result.rows.map(row => ({
                ...row,
                present: Number(row.present || 0),
                late: Number(row.late || 0),
                hours: formatHours(Number(row.working_minutes || 0))
            }))
        });

    } catch (error) {

        console.error("GET MONTHLY ATTENDANCE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load monthly attendance"
        });
    }
};