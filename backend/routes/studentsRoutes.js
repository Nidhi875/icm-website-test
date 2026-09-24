
const express = require("express");
const pool = require("../config/db");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

const ALLOWED_STATUSES = [
  "pending",
  "admitted",
  "rejected",
  "enrolled"
];

/*
==========================================================
GET /api/students

Administrator can view all registered students.
==========================================================
*/

router.get("/", requireAdmin, async (req, res) => {
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
      LEFT JOIN applications a
        ON a.user_id = u.id
      ORDER BY u.id DESC
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

/*
==========================================================
PUT /api/students/:userId

Administrator can edit student information and application.
==========================================================
*/

router.put("/:userId", requireAdmin, async (req, res) => {
  const { userId } = req.params;

  const {
    full_name,
    email,
    status = "pending",
    fee_amount = 0
  } = req.body;

  if (!full_name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required"
    });
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid application status"
    });
  }

  const fee = Number(fee_amount);

  if (!Number.isFinite(fee) || fee < 0) {
    return res.status(400).json({
      success: false,
      message: "Fee must be zero or a positive number"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const studentResult = await client.query(
      `
      UPDATE users
      SET
        full_name = $1,
        email = $2
      WHERE id = $3
      RETURNING id, full_name, email, student_id
      `,
      [full_name.trim(), email.trim().toLowerCase(), userId]
    );

    if (studentResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const applicationResult = await client.query(
      `
      INSERT INTO applications
        (user_id, status, fee_amount)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        fee_amount = EXCLUDED.fee_amount,
        updated_at = NOW()
      RETURNING *
      `,
      [userId, status, fee]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      student: studentResult.rows[0],
      application: applicationResult.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("UPDATE STUDENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update student"
    });
  } finally {
    client.release();
  }
});

/*
==========================================================
PUT /api/students/:userId/status

Compatibility route for status-only updates.
==========================================================
*/

router.put("/:userId/status", requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const { status, feeAmount } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status"
    });
  }

  const fee = Number(feeAmount);

  if (!Number.isFinite(fee) || fee < 0) {
    return res.status(400).json({
      success: false,
      message: "Fee must be zero or a positive number"
    });
  }

  try {
    const studentResult = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO applications
        (user_id, status, fee_amount)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        fee_amount = EXCLUDED.fee_amount,
        updated_at = NOW()
      RETURNING *
      `,
      [userId, status, fee]
    );

    res.json({
      success: true,
      application: result.rows[0]
    });
  } catch (error) {
    console.error("UPDATE STUDENT STATUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update status"
    });
  }
});

/*
==========================================================
DELETE /api/students/:userId

Administrator can delete a registered student.
==========================================================
*/

router.delete("/:userId", requireAdmin, async (req, res) => {
  const { userId } = req.params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const studentResult = await client.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (studentResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    await client.query(
      `DELETE FROM applications WHERE user_id = $1`,
      [userId]
    );

    await client.query(
      `DELETE FROM users WHERE id = $1`,
      [userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("DELETE STUDENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete student"
    });
  } finally {
    client.release();
  }
});

module.exports = router;