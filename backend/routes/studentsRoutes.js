const express = require("express");
const pool = require("../config/db");
const router = express.Router();

/* ==========================================================
   GET /api/students
   List every student with their current application status.
   Students who don't have an applications row yet show as 'pending'.
   ========================================================== */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.student_id,
        COALESCE(a.status, 'pending') AS status,
        COALESCE(a.fee_amount, 0) AS fee_amount,
        a.updated_at
      FROM users u
      LEFT JOIN applications a ON a.user_id = u.id
      ORDER BY u.id DESC
    `);
    res.json({ success: true, students: result.rows });
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to load students" });
  }
});

/* ==========================================================
   PUT /api/students/:userId/status
   Staff use this to mark a student admitted / rejected / enrolled,
   and set the fee once admitted/enrolled.
   Body: { status: "admitted", feeAmount: 1500 }
   ========================================================== */
router.put("/:userId/status", async (req, res) => {
  const { userId } = req.params;
  const { status, feeAmount } = req.body;

  const allowed = ["pending", "admitted", "rejected", "enrolled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const fee = Number(feeAmount) || 0;
  if (fee < 0) {
    return res.status(400).json({ success: false, message: "Fee must be zero or positive" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO applications (user_id, status, fee_amount)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET status = $2, fee_amount = $3, updated_at = NOW()
      RETURNING *
      `,
      [userId, status, fee]
    );
    res.json({ success: true, application: result.rows[0] });
  } catch (error) {
    console.error("UPDATE STUDENT STATUS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

module.exports = router;