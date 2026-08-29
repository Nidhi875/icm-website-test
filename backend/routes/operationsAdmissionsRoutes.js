const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const pool = require("../config/db");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS operations_student_progression (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(100) NOT NULL UNIQUE,
    student_name VARCHAR(255) NOT NULL,
    sales_agent VARCHAR(255),
    destination_country VARCHAR(100),
    university VARCHAR(255),
    gouldings_course VARCHAR(255),
    application_status VARCHAR(100),
    offer_status VARCHAR(100),
    admission_status VARCHAR(100),
    revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS operations_import_batches (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    records_processed INTEGER NOT NULL DEFAULT 0,
    new_records INTEGER NOT NULL DEFAULT 0,
    updated_records INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

async function ensureTables(client = pool) {
  await client.query(TABLE_SQL);
}

function clean(value) {
  return String(value ?? "").trim();
}

function normaliseHeader(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[\n\r]+/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function pick(row, aliases) {
  const keys = Object.keys(row);
  const wanted = aliases.map(normaliseHeader);
  const key = keys.find(k => wanted.includes(normaliseHeader(k)));
  return key ? row[key] : "";
}

function parseRevenue(value) {
  const cleaned = clean(value).replace(/[^0-9.-]/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function normaliseRecord(row) {
  return {
    studentId: clean(pick(row, ["Student ID", "StudentID", "Student Id", "ID"])),
    studentName: clean(pick(row, ["Student Name", "Name", "Student"])),
    salesAgent: clean(pick(row, ["Sales Agent", "SalesAgent", "Agent"])),
    destinationCountry: clean(pick(row, ["Destination Country", "Country", "Destination"])),
    university: clean(pick(row, ["University", "University Name"])),
    gouldingsCourse: clean(pick(row, ["Gouldings Course", "Course", "GouldingsCourse"])),
    applicationStatus: clean(pick(row, ["Application Status", "ApplicationStatus", "Application"])),
    offerStatus: clean(pick(row, ["Offer Status", "OfferStatus", "Offer"])),
    admissionStatus: clean(pick(row, ["Admission Status", "AdmissionStatus", "Admission"])),
    revenue: parseRevenue(pick(row, ["Revenue", "Fee", "Fee Amount", "Revenue Amount"]))
  };
}

function statusIn(value, statuses) {
  return statuses.includes(clean(value).toLowerCase());
}

/* ==========================================================
   GET OPERATIONS ADMISSIONS DASHBOARD
   ========================================================== */
router.get("/dashboard", async (req, res) => {
  try {
    await ensureTables();

    const summaryResult = await pool.query(`
      SELECT
        COUNT(*)::int AS total_students,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(application_status, '')) IN
          ('submitted', 'under review', 'under_review')
        )::int AS applications,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(offer_status, '')) IN ('received', 'accepted')
        )::int AS offers,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(admission_status, '')) IN
          ('confirmed', 'enrolled', 'progressed')
        )::int AS admissions,
        COALESCE(SUM(revenue), 0)::numeric AS revenue,
        MAX(updated_at) AS last_data_update
      FROM operations_student_progression
    `);

    const countryResult = await pool.query(`
      SELECT
        COALESCE(NULLIF(destination_country, ''), 'Unknown') AS country,
        COUNT(*)::int AS students,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(application_status, '')) IN
          ('submitted', 'under review', 'under_review')
        )::int AS applications,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(offer_status, '')) IN ('received', 'accepted')
        )::int AS offers,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(admission_status, '')) IN
          ('confirmed', 'enrolled', 'progressed')
        )::int AS admissions
      FROM operations_student_progression
      GROUP BY destination_country
      ORDER BY applications DESC, students DESC
    `);

    const universityResult = await pool.query(`
      SELECT
        COALESCE(NULLIF(university, ''), 'Unknown') AS university,
        COALESCE(NULLIF(destination_country, ''), 'Unknown') AS country,
        COUNT(*)::int AS students,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(application_status, '')) IN
          ('submitted', 'under review', 'under_review')
        )::int AS applications,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(offer_status, '')) IN ('received', 'accepted')
        )::int AS offers,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(admission_status, '')) IN
          ('confirmed', 'enrolled', 'progressed')
        )::int AS admissions
      FROM operations_student_progression
      GROUP BY university, destination_country
      ORDER BY applications DESC, students DESC, university ASC
      LIMIT 100
    `);

    const agentResult = await pool.query(`
      SELECT
        COALESCE(NULLIF(sales_agent, ''), 'Unassigned') AS agent,
        COUNT(*)::int AS students,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(application_status, '')) IN
          ('submitted', 'under review', 'under_review')
        )::int AS applications,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(offer_status, '')) IN ('received', 'accepted')
        )::int AS offers,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(admission_status, '')) IN
          ('confirmed', 'enrolled', 'progressed')
        )::int AS admissions,
        COALESCE(SUM(revenue), 0)::numeric AS revenue
      FROM operations_student_progression
      GROUP BY sales_agent
      ORDER BY admissions DESC, applications DESC, students DESC
    `);

    const attentionResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(application_status, '')) = 'documents pending'
        )::int AS documents_pending,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(application_status, '')) = 'preparing'
        )::int AS applications_preparing,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(offer_status, '')) IN ('pending', 'not received')
          AND LOWER(COALESCE(application_status, '')) IN
              ('submitted', 'under review', 'under_review')
        )::int AS offers_pending,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(admission_status, '')) = 'pending'
          AND LOWER(COALESCE(offer_status, '')) IN ('received', 'accepted')
        )::int AS admissions_pending
      FROM operations_student_progression
    `);

    const studentsResult = await pool.query(`
      SELECT
        student_id,
        student_name,
        sales_agent,
        destination_country,
        university,
        gouldings_course,
        application_status,
        offer_status,
        admission_status,
        revenue,
        updated_at
      FROM operations_student_progression
      ORDER BY updated_at DESC, student_name ASC
      LIMIT 250
    `);

    const importResult = await pool.query(`
      SELECT
        file_name,
        records_processed,
        new_records,
        updated_records,
        error_count,
        imported_at
      FROM operations_import_batches
      ORDER BY imported_at DESC
      LIMIT 1
    `);

    const summary = summaryResult.rows[0];
    const attention = attentionResult.rows[0];

    res.json({
      success: true,
      summary: {
        totalStudents: Number(summary.total_students),
        applications: Number(summary.applications),
        offers: Number(summary.offers),
        admissions: Number(summary.admissions),
        revenue: Number(summary.revenue),
        lastDataUpdate: summary.last_data_update
      },
      countries: countryResult.rows.map(row => ({
        country: row.country,
        students: Number(row.students),
        applications: Number(row.applications),
        offers: Number(row.offers),
        admissions: Number(row.admissions)
      })),
      universities: universityResult.rows.map(row => ({
        university: row.university,
        country: row.country,
        students: Number(row.students),
        applications: Number(row.applications),
        offers: Number(row.offers),
        admissions: Number(row.admissions)
      })),
      agents: agentResult.rows.map(row => ({
        agent: row.agent,
        students: Number(row.students),
        applications: Number(row.applications),
        offers: Number(row.offers),
        admissions: Number(row.admissions),
        revenue: Number(row.revenue)
      })),
      attention: {
        documentsPending: Number(attention.documents_pending),
        applicationsPreparing: Number(attention.applications_preparing),
        offersPending: Number(attention.offers_pending),
        admissionsPending: Number(attention.admissions_pending)
      },
      students: studentsResult.rows.map(row => ({
        studentId: row.student_id,
        studentName: row.student_name,
        salesAgent: row.sales_agent,
        country: row.destination_country,
        university: row.university,
        course: row.gouldings_course,
        applicationStatus: row.application_status,
        offerStatus: row.offer_status,
        admissionStatus: row.admission_status,
        revenue: Number(row.revenue),
        updatedAt: row.updated_at
      })),
      lastImport: importResult.rows[0] || null
    });
  } catch (error) {
    console.error("OPERATIONS DASHBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load Operations admissions dashboard"
    });
  }
});

/* ==========================================================
   IMPORT EXCEL
   POST /api/operations/admissions/import
   ========================================================== */
router.post("/admissions/import", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please select an Excel file."
    });
  }

  const extension = req.file.originalname.toLowerCase();
  if (!extension.endsWith(".xlsx") && !extension.endsWith(".xls")) {
    return res.status(400).json({
      success: false,
      message: "Only .xlsx and .xls files are supported."
    });
  }

  let workbook;
  try {
    workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  } catch (error) {
    console.error("EXCEL READ ERROR:", error);
    return res.status(400).json({
      success: false,
      message: "The Excel file could not be read."
    });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return res.status(400).json({
      success: false,
      message: "The Excel file contains no worksheet."
    });
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: "",
    raw: false
  });

  if (!rows.length) {
    return res.status(400).json({
      success: false,
      message: "The first worksheet contains no student records."
    });
  }

  const records = [];
  const errors = [];
  const seen = new Set();

  rows.forEach((row, index) => {
    const record = normaliseRecord(row);
    const excelRow = index + 2;

    if (!record.studentId) {
      errors.push(`Row ${excelRow}: Student ID is missing.`);
      return;
    }

    if (!record.studentName) {
      errors.push(`Row ${excelRow}: Student Name is missing.`);
      return;
    }

    const key = record.studentId.toLowerCase();
    if (seen.has(key)) {
      errors.push(`Row ${excelRow}: duplicate Student ID ${record.studentId}; latest row ignored.`);
      return;
    }

    seen.add(key);
    records.push(record);
  });

  if (!records.length) {
    return res.status(400).json({
      success: false,
      message: "No valid student records were found.",
      errors
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await ensureTables(client);

    const ids = records.map(record => record.studentId);
    const existingResult = await client.query(
      `SELECT student_id FROM operations_student_progression WHERE student_id = ANY($1::text[])`,
      [ids]
    );

    const existingIds = new Set(
      existingResult.rows.map(row => row.student_id)
    );

    let newRecords = 0;
    let updatedRecords = 0;

    for (const record of records) {
      if (existingIds.has(record.studentId)) {
        updatedRecords++;
      } else {
        newRecords++;
      }

      await client.query(
        `
          INSERT INTO operations_student_progression
          (
            student_id,
            student_name,
            sales_agent,
            destination_country,
            university,
            gouldings_course,
            application_status,
            offer_status,
            admission_status,
            revenue,
            imported_at,
            updated_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
          ON CONFLICT (student_id)
          DO UPDATE SET
            student_name = EXCLUDED.student_name,
            sales_agent = EXCLUDED.sales_agent,
            destination_country = EXCLUDED.destination_country,
            university = EXCLUDED.university,
            gouldings_course = EXCLUDED.gouldings_course,
            application_status = EXCLUDED.application_status,
            offer_status = EXCLUDED.offer_status,
            admission_status = EXCLUDED.admission_status,
            revenue = EXCLUDED.revenue,
            imported_at = NOW(),
            updated_at = NOW()
        `,
        [
          record.studentId,
          record.studentName,
          record.salesAgent || null,
          record.destinationCountry || null,
          record.university || null,
          record.gouldingsCourse || null,
          record.applicationStatus || null,
          record.offerStatus || null,
          record.admissionStatus || null,
          record.revenue
        ]
      );
    }

    const batchResult = await client.query(
      `
        INSERT INTO operations_import_batches
        (file_name, records_processed, new_records, updated_records, error_count)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
      `,
      [
        req.file.originalname,
        records.length,
        newRecords,
        updatedRecords,
        errors.length
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Admissions Excel imported successfully.",
      import: {
        fileName: req.file.originalname,
        recordsProcessed: records.length,
        newRecords,
        updatedRecords,
        errorCount: errors.length,
        errors,
        importedAt: batchResult.rows[0].imported_at
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("OPERATIONS EXCEL IMPORT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "The Excel import failed. No partial import was saved."
    });
  } finally {
    client.release();
  }
});

module.exports = router;
