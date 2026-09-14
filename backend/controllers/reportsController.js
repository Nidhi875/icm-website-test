const pool = require("../config/db");

function getPeriod(range) {
  const allowed = ["this_month", "last_month", "this_year"];
  const value = allowed.includes(range) ? range : "this_month";

  if (value === "last_month") {
    return {
      range: value,
      startSql: "DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'",
      endSql: "DATE_TRUNC('month', CURRENT_DATE)"
    };
  }

  if (value === "this_year") {
    return {
      range: value,
      startSql: "DATE_TRUNC('year', CURRENT_DATE)",
      endSql: "CURRENT_DATE + INTERVAL '1 day'"
    };
  }

  return {
    range: value,
    startSql: "DATE_TRUNC('month', CURRENT_DATE)",
    endSql: "CURRENT_DATE + INTERVAL '1 day'"
  };
}

function n(value) {
  return Number(value || 0);
}

exports.getReports = async (req, res) => {
  const period = getPeriod(req.query.range);

  try {
    // The admissions/operations data is the currently connected student data source.
    const summaryResult = await pool.query(`
      SELECT
        COUNT(*)::int AS total_students,
        COUNT(*) FILTER (
          WHERE NULLIF(TRIM(application_status), '') IS NOT NULL
        )::int AS applications,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(admission_status, '')) ~ '(admit|admission|enrolled|accepted|complete)'
        )::int AS admissions,
        COALESCE(SUM(revenue), 0)::numeric AS revenue
      FROM operations_student_progression
    `);

    const periodResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE imported_at >= ${period.startSql} AND imported_at < ${period.endSql}
        )::int AS new_records,
        COUNT(*) FILTER (
          WHERE NULLIF(TRIM(application_status), '') IS NOT NULL
            AND updated_at >= ${period.startSql} AND updated_at < ${period.endSql}
        )::int AS applications_updated,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(admission_status, '')) ~ '(admit|admission|enrolled|accepted|complete)'
            AND updated_at >= ${period.startSql} AND updated_at < ${period.endSql}
        )::int AS admissions_updated
      FROM operations_student_progression
    `);

    const courseResult = await pool.query(`
      SELECT
        COALESCE(NULLIF(TRIM(gouldings_course), ''), 'Unspecified') AS course,
        COUNT(*)::int AS students,
        COUNT(*) FILTER (WHERE NULLIF(TRIM(application_status), '') IS NOT NULL)::int AS applications,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(admission_status, '')) ~ '(admit|admission|enrolled|accepted|complete)'
        )::int AS admissions,
        COALESCE(SUM(revenue), 0)::numeric AS revenue
      FROM operations_student_progression
      GROUP BY 1
      ORDER BY students DESC, course ASC
    `);

    const statusResult = await pool.query(`
      SELECT
        COALESCE(NULLIF(TRIM(admission_status), ''), 'Not set') AS status,
        COUNT(*)::int AS count
      FROM operations_student_progression
      GROUP BY 1
      ORDER BY count DESC, status ASC
    `);

    const revenuePeriodResult = await pool.query(`
      SELECT
        COALESCE(SUM(revenue) FILTER (
          WHERE updated_at >= ${period.startSql} AND updated_at < ${period.endSql}
        ), 0)::numeric AS revenue_period,
        COALESCE(SUM(revenue) FILTER (
          WHERE updated_at >= ${period.startSql} AND updated_at < ${period.endSql}
        ), 0)::numeric AS revenue_updated_period
      FROM operations_student_progression
    `);

    const attendanceResult = await pool.query(`
      SELECT
        COUNT(a.id) FILTER (WHERE a.status IN ('present','offline'))::int AS present,
        COUNT(a.id)::int AS recorded,
        COUNT(a.id) FILTER (WHERE a.is_late = TRUE)::int AS late
      FROM attendance a
      WHERE a.attendance_date >= ${period.startSql}::date
        AND a.attendance_date < ${period.endSql}::date
    `);

    const staffResult = await pool.query(`
      SELECT id, name, email, role, department
      FROM staff
      ORDER BY name ASC
    `);

    const tutorAttendanceResult = await pool.query(`
      SELECT
        s.id AS staff_id,
        s.name,
        s.role,
        COUNT(a.id) FILTER (WHERE a.status IN ('present','offline'))::int AS present,
        COUNT(a.id)::int AS recorded,
        COUNT(a.id) FILTER (WHERE a.is_late = TRUE)::int AS late,
        COALESCE(SUM(a.working_minutes), 0)::int AS working_minutes
      FROM staff s
      LEFT JOIN attendance a
        ON a.staff_id = s.id
       AND a.attendance_date >= ${period.startSql}::date
       AND a.attendance_date < ${period.endSql}::date
      GROUP BY s.id, s.name, s.role
      ORDER BY s.name ASC
    `);

    const attentionResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE LOWER(COALESCE(application_status,'')) LIKE '%document%')::int AS documents_pending,
        COUNT(*) FILTER (WHERE LOWER(COALESCE(application_status,'')) LIKE '%prepar%')::int AS applications_preparing,
        COUNT(*) FILTER (WHERE LOWER(COALESCE(offer_status,'')) LIKE '%pending%')::int AS offers_pending,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(admission_status,'')) LIKE '%pending%'
             OR LOWER(COALESCE(admission_status,'')) LIKE '%await%'
        )::int AS admissions_pending
      FROM operations_student_progression
    `);

    const summary = summaryResult.rows[0];
    const periodData = periodResult.rows[0];
    const attendance = attendanceResult.rows[0];
    const attention = attentionResult.rows[0];

    const attendanceRate = n(attendance.recorded)
      ? Number((n(attendance.present) / n(attendance.recorded) * 100).toFixed(1))
      : 0;

    const previousPeriod = period.range === "this_year" ? "last_year" : "previous_period";

    res.json({
      success: true,
      range: period.range,
      generatedAt: new Date().toISOString(),
      dataAvailability: {
        admissions: true,
        staffAttendance: true,
        assignmentSubmission: false,
        studentAttendance: false,
        tutorClasses: false,
        tutorRatings: false,
        operationsTasks: false,
        meetings: false
      },
      notice: "Live data is connected for admissions/operations records and staff attendance. Student attendance, assignments, tutor class/ratings, operations task records, meetings, and period-based financial transactions are not stored in the current backend data model.",
      summary: {
        totalStudents: n(summary.total_students),
        newEnrollments: n(periodData.new_records),
        activeApplications: n(summary.applications),
        admissions: n(summary.admissions),
        revenue: Number(summary.revenue || 0)
      },
      trend: [
        { label: "New records", value: n(periodData.new_records) },
        { label: "Applications", value: n(summary.applications) },
        { label: "Admissions", value: n(summary.admissions) },
        { label: "Revenue", value: Number(summary.revenue || 0) }
      ],
      enrollment: {
        byCourse: courseResult.rows.map(row => ({
          course: row.course,
          students: n(row.students),
          applications: n(row.applications),
          admissions: n(row.admissions),
          revenue: Number(row.revenue || 0)
        })),
        status: statusResult.rows.map(row => ({ status: row.status, count: n(row.count) })),
        completion: courseResult.rows.map(row => ({
          course: row.course,
          students: n(row.students),
          completed: n(row.admissions),
          rate: n(row.students) ? Number((n(row.admissions) / n(row.students) * 100).toFixed(1)) : 0
        }))
      },
      attendance: {
        rate: attendanceRate,
        submissionRate: null,
        staffRecorded: n(attendance.recorded),
        late: n(attendance.late),
        riskStudents: []
      },
      tutors: tutorAttendanceResult.rows.map(row => ({
        name: row.name,
        role: row.role || "",
        present: n(row.present),
        recorded: n(row.recorded),
        late: n(row.late),
        hours: Math.round(n(row.working_minutes) / 6) / 10,
        classesTaught: null,
        rating: null,
        responseTime: null
      })),
      operations: {
        stats: {
          documentsPending: n(attention.documents_pending),
          applicationsPreparing: n(attention.applications_preparing),
          offersPending: n(attention.offers_pending),
          admissionsPending: n(attention.admissions_pending)
        },
        completedByMember: [],
        status: [],
        openTasks: []
      },
      finance: {
        revenueThisPeriod: Number(revenuePeriodResult.rows[0].revenue_period || 0),
        revenueLastPeriod: null,
        revenueByCourse: courseResult.rows.map(row => ({
          course: row.course,
          revenue: Number(row.revenue || 0)
        })),
        periodBasedTransactionsAvailable: false
      },
      staff: staffResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        department: row.department
      })),
      unsupported: {
        previousPeriod,
        message: "Some requested report metrics require data tables that do not currently exist in the backend. They are returned as unavailable instead of being fabricated."
      }
    });
  } catch (error) {
    console.error("REPORTS API ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load reports",
      error: process.env.NODE_ENV === "production" ? undefined : error.message
    });
  }
};
