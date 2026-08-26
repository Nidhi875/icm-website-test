const express = require("express");
const pool = require("../config/db");
const requireGoalsEditor = require("../middleware/requireGoalsEditor");
const router = express.Router();

async function ensureGoalsTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS sales_goals (id SMALLINT PRIMARY KEY CHECK (id = 1), admissions_actual INTEGER NOT NULL DEFAULT 0, admissions_target INTEGER NOT NULL DEFAULT 100, applications_actual INTEGER NOT NULL DEFAULT 0, applications_target INTEGER NOT NULL DEFAULT 100, enrolment_actual INTEGER NOT NULL DEFAULT 0, enrolment_target INTEGER NOT NULL DEFAULT 100, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await pool.query("INSERT INTO sales_goals (id) VALUES (1) ON CONFLICT (id) DO NOTHING");
}

router.get("/", async (req, res) => {
  try { await ensureGoalsTable(); const result = await pool.query("SELECT * FROM sales_goals WHERE id = 1"); res.json(result.rows[0]); }
  catch { res.status(500).json({ message: "Unable to load sales goals." }); }
});

router.put("/", requireGoalsEditor, async (req, res) => {
  const names = ["admissions_actual", "admissions_target", "applications_actual", "applications_target", "enrolment_actual", "enrolment_target"];
  const values = names.map(name => Number(req.body[name]));
  if (values.some(value => !Number.isFinite(value) || value < 0)) return res.status(400).json({ message: "Use zero or positive numbers." });
  try {
    await ensureGoalsTable();
    const result = await pool.query(`UPDATE sales_goals SET admissions_actual=$1, admissions_target=$2, applications_actual=$3, applications_target=$4, enrolment_actual=$5, enrolment_target=$6, updated_at=NOW() WHERE id=1 RETURNING *`, values);
    res.json(result.rows[0]);
  } catch { res.status(500).json({ message: "Unable to save sales goals." }); }
});
module.exports = router;
