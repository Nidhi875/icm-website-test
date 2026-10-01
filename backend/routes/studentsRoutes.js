const express = require("express");

const pool = require("../config/db");

const requireAdmin = require("../middleware/requireAdmin");

const {
    getStudentDetails,
    updateStudentDetails
} = require("../controllers/studentDetailsController");

const router = express.Router();


// ============================================================
// EXISTING STUDENT LIST
// ============================================================

router.get("/", requireAdmin, async (req, res) => {

    try {
        const operationsTable = await pool.query(`
            SELECT to_regclass('public.operations_student_progression') AS table_name
        `);

        // Once an Operations Excel import exists, it is the source of truth for
        // Student Records. Do not append old portal accounts: they may belong to
        // previous intakes and would make the admin count differ from the file.
        const result = operationsTable.rows[0]?.table_name
            ? await pool.query(`
                SELECT
                    COALESCE(u.id::text, 'operations-' || o.id::text) AS id,
                    COALESCE(NULLIF(u.full_name, ''), o.student_name) AS full_name,
                    u.email,
                    o.student_id,
                    COALESCE(
                        NULLIF(o.admission_status, ''),
                        NULLIF(o.offer_status, ''),
                        NULLIF(o.application_status, ''),
                        a.status,
                        'pending'
                    ) AS status,
                    COALESCE(o.revenue, a.fee_amount, 0) AS fee_amount,
                    o.application_status,
                    o.offer_status,
                    o.admission_status,
                    o.university,
                    o.destination_country,
                    o.gouldings_course,
                    o.updated_at,
                    CASE WHEN u.id IS NULL THEN 'operations' ELSE 'portal' END AS source
                FROM operations_student_progression o
                LEFT JOIN users u
                    ON LOWER(TRIM(u.student_id)) = LOWER(TRIM(o.student_id))
                LEFT JOIN applications a
                    ON a.user_id = u.id
                ORDER BY o.updated_at DESC NULLS LAST, o.student_name ASC
            `)
            : await pool.query(`
                SELECT
                    u.id::text AS id,
                    u.full_name,
                    u.email,
                    u.student_id,
                    COALESCE(a.status, 'pending') AS status,
                    COALESCE(a.fee_amount, 0) AS fee_amount,
                    NULL::varchar AS application_status,
                    NULL::varchar AS offer_status,
                    NULL::varchar AS admission_status,
                    a.university,
                    a.destination_country,
                    a.course AS gouldings_course,
                    a.updated_at,
                    'portal' AS source
                FROM users u
                LEFT JOIN applications a
                    ON a.user_id = u.id
                ORDER BY a.updated_at DESC NULLS LAST, u.full_name ASC
            `);

        res.json({
            success: true,
            students: result.rows
        });

    } catch (error) {

        console.error("GET STUDENTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load students"
        });
    }
});


// ============================================================
// STUDENT STATUS
// ============================================================

router.put("/:userId/status", requireAdmin, async (req, res) => {

    const { userId } = req.params;

    const {
        status,
        feeAmount
    } = req.body;

    const allowed = [
        "pending",
        "admitted",
        "rejected",
        "enrolled"
    ];

    if (!allowed.includes(status)) {

        return res.status(400).json({
            success: false,
            message: "Invalid status"
        });
    }

    const fee = Number(feeAmount) || 0;

    if (fee < 0) {

        return res.status(400).json({
            success: false,
            message: "Fee must be zero or positive"
        });
    }

    try {

        const result = await pool.query(`
            INSERT INTO applications (
                user_id,
                status,
                fee_amount
            )

            VALUES ($1,$2,$3)

            ON CONFLICT (user_id)

            DO UPDATE SET
                status = $2,
                fee_amount = $3,
                updated_at = NOW()

            RETURNING *
        `, [
            userId,
            status,
            fee
        ]);

        res.json({
            success: true,
            application: result.rows[0]
        });

    } catch (error) {

        console.error(
            "UPDATE STUDENT STATUS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update status"
        });
    }
});


// ============================================================
// COMPLETE STUDENT DETAILS — ADMIN ONLY
// ============================================================

router.get(
    "/:id/details",
    requireAdmin,
    getStudentDetails
);


// ============================================================
// UPDATE COMPLETE STUDENT DETAILS — ADMIN ONLY
// ============================================================

router.put(
    "/:id/details",
    requireAdmin,
    updateStudentDetails
);


module.exports = router;

module.exports = router;