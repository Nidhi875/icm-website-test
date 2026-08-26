const express = require("express");
const pool = require("../config/db");
const router = express.Router();

/* ==========================================================
   GET /api/team-performance
   Powers the 4 cards: Applications, Admissions, Revenue, Response Rate.
   ========================================================== */
router.get("/", async (req, res) => {
  try {
    // Applications, Admissions, Revenue — from the applications table
    const appStats = await pool.query(`
      SELECT
        COUNT(*) AS applications,
        COUNT(*) FILTER (WHERE status IN ('admitted', 'enrolled')) AS admissions,
        COALESCE(SUM(fee_amount) FILTER (WHERE status IN ('admitted', 'enrolled')), 0) AS revenue
      FROM applications
    `);

    // Response Rate — % of staff-initiated conversations where the
    // student sent at least one message back.
    const responseStats = await pool.query(`
      WITH staff_convos AS (
        SELECT DISTINCT conversation_id FROM messages WHERE sender_role = 'staff'
      ),
      student_convos AS (
        SELECT DISTINCT conversation_id FROM messages WHERE sender_role = 'student'
      )
      SELECT
        (SELECT COUNT(*) FROM staff_convos) AS outreach,
        (SELECT COUNT(*) FROM staff_convos sc
           WHERE sc.conversation_id IN (SELECT conversation_id FROM student_convos)) AS responded
    `);

    const { applications, admissions, revenue } = appStats.rows[0];
    const { outreach, responded } = responseStats.rows[0];

    const responseRate = outreach > 0
      ? Math.round((responded / outreach) * 100)
      : 0;

    res.json({
      success: true,
      applications: Number(applications),
      admissions: Number(admissions),
      revenue: Number(revenue),
      responseRate,
    });
  } catch (error) {
    console.error("TEAM PERFORMANCE ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to load team performance" });
  }
});

module.exports = router;