const pool = require("../config/db");


// ============================================================
// GET COMPLETE STUDENT DETAILS
// ============================================================

async function getStudentDetails(req, res) {

    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid student ID."
        });
    }

    try {
const userResult = await pool.query(`
    SELECT
        id,
        full_name,
        email,
        student_id
    FROM users
    WHERE id = $1
`, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        const profileResult = await pool.query(`
            SELECT *
            FROM student_profiles
            WHERE user_id = $1
        `, [userId]);

        const academicResult = await pool.query(`
            SELECT *
            FROM student_academic
            WHERE user_id = $1
        `, [userId]);

        // The Operations table is created by the Excel importer. Read it when
        // available; otherwise fall back to the normal applications record so
        // the Student Details modal still works before the first Excel import.
        const operationsTableResult = await pool.query(`
            SELECT to_regclass('public.operations_student_progression') AS table_name
        `);

        let applicationResult;

        if (operationsTableResult.rows[0]?.table_name) {
            applicationResult = await pool.query(`
                SELECT
                    a.id,
                    a.user_id,
                    COALESCE(NULLIF(o.application_status, ''), a.status) AS status,
                    COALESCE(NULLIF(o.revenue::text, ''), a.fee_amount::text, '0')::numeric AS fee_amount,
                    COALESCE(NULLIF(o.gouldings_course, ''), a.course) AS course,
                    COALESCE(NULLIF(o.university, ''), a.university) AS university,
                    COALESCE(NULLIF(o.destination_country, ''), a.destination_country) AS destination_country,
                    a.intake,
                    a.study_level,
                    a.application_date,
                    a.assigned_staff,
                    COALESCE(NULLIF(o.offer_status, ''), a.offer_status) AS offer_status,
                    COALESCE(NULLIF(o.admission_status, ''), a.admission_status) AS admission_status,
                    a.enrollment_status,
                    a.notes,
                    a.created_at,
                    a.updated_at,
                    o.updated_at AS operations_updated_at,
                    o.imported_at AS operations_imported_at
                FROM users u
                LEFT JOIN applications a
                    ON a.user_id = u.id
                LEFT JOIN operations_student_progression o
                    ON LOWER(TRIM(o.student_id)) = LOWER(TRIM(u.student_id))
                WHERE u.id = $1
            `, [userId]);
        } else {
            applicationResult = await pool.query(`
                SELECT *
                FROM applications
                WHERE user_id = $1
            `, [userId]);
        }

        const documentsResult = await pool.query(`
            SELECT *
            FROM student_documents
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [userId]);

        const paymentsResult = await pool.query(`
            SELECT *
            FROM student_payments
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [userId]);

        const messagesResult = await pool.query(`
            SELECT *
            FROM student_messages
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [userId]);

        const activityResult = await pool.query(`
            SELECT *
            FROM student_activity
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [userId]);


        return res.json({
            success: true,

            student: userResult.rows[0],

            profile: profileResult.rows[0] || null,

            academic: academicResult.rows[0] || null,

            application: applicationResult.rows[0] || null,

            documents: documentsResult.rows,

            payments: paymentsResult.rows,

            messages: messagesResult.rows,

            activity: activityResult.rows
        });

    } catch (error) {

        console.error("GET STUDENT DETAILS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load student details."
        });
    }
}


// ============================================================
// SAVE PERSONAL + ACADEMIC + APPLICATION
// ============================================================

async function updateStudentDetails(req, res) {

    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid student ID."
        });
    }

    const {
        full_name,
        email,
        profile,
        academic,
        application
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // ------------------------------------------------------
        // USER — only update fields actually supplied by the UI
        // ------------------------------------------------------
        if (full_name !== undefined || email !== undefined) {
            const current = await client.query(
                `SELECT full_name, email FROM users WHERE id = $1`,
                [userId]
            );

            if (!current.rows.length) {
                await client.query("ROLLBACK");
                return res.status(404).json({
                    success: false,
                    message: "Student not found."
                });
            }

            await client.query(`
              UPDATE users
                SET
              full_name = $1,
              email = $2
             WHERE id = $3
            `, [
                full_name !== undefined ? full_name : current.rows[0].full_name,
                email !== undefined ? email : current.rows[0].email,
                userId
            ]);
        }

        // ------------------------------------------------------
        // PROFILE — only touch this table when profile was sent
        // ------------------------------------------------------
        if (profile !== undefined) {
            const existing = await client.query(
                `SELECT * FROM student_profiles WHERE user_id = $1`,
                [userId]
            );
            const p = existing.rows[0] || {};

            await client.query(`
                INSERT INTO student_profiles (
                    user_id,
                    preferred_name,
                    phone,
                    whatsapp_number,
                    date_of_birth,
                    gender,
                    nationality,
                    address,
                    city,
                    country,
                    emergency_contact_name,
                    emergency_contact_phone,
                    emergency_contact_relationship,
                    profile_photo_url,
                    account_status,
                    updated_at
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
                ON CONFLICT (user_id)
                DO UPDATE SET
                    preferred_name = EXCLUDED.preferred_name,
                    phone = EXCLUDED.phone,
                    whatsapp_number = EXCLUDED.whatsapp_number,
                    date_of_birth = EXCLUDED.date_of_birth,
                    gender = EXCLUDED.gender,
                    nationality = EXCLUDED.nationality,
                    address = EXCLUDED.address,
                    city = EXCLUDED.city,
                    country = EXCLUDED.country,
                    emergency_contact_name = EXCLUDED.emergency_contact_name,
                    emergency_contact_phone = EXCLUDED.emergency_contact_phone,
                    emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
                    profile_photo_url = EXCLUDED.profile_photo_url,
                    account_status = EXCLUDED.account_status,
                    updated_at = NOW()
            `, [
                userId,
                profile.preferred_name !== undefined ? profile.preferred_name : (p.preferred_name || null),
                profile.phone !== undefined ? profile.phone : (p.phone || null),
                profile.whatsapp_number !== undefined ? profile.whatsapp_number : (p.whatsapp_number || null),
                profile.date_of_birth !== undefined ? profile.date_of_birth : (p.date_of_birth || null),
                profile.gender !== undefined ? profile.gender : (p.gender || null),
                profile.nationality !== undefined ? profile.nationality : (p.nationality || null),
                profile.address !== undefined ? profile.address : (p.address || null),
                profile.city !== undefined ? profile.city : (p.city || null),
                profile.country !== undefined ? profile.country : (p.country || null),
                profile.emergency_contact_name !== undefined ? profile.emergency_contact_name : (p.emergency_contact_name || null),
                profile.emergency_contact_phone !== undefined ? profile.emergency_contact_phone : (p.emergency_contact_phone || null),
                profile.emergency_contact_relationship !== undefined ? profile.emergency_contact_relationship : (p.emergency_contact_relationship || null),
                profile.profile_photo_url !== undefined ? profile.profile_photo_url : (p.profile_photo_url || null),
                profile.account_status !== undefined ? profile.account_status : (p.account_status || "Active")
            ]);
        }

        // ------------------------------------------------------
        // ACADEMIC — only touch this table when academic was sent
        // ------------------------------------------------------
        if (academic !== undefined) {
            const existing = await client.query(
                `SELECT * FROM student_academic WHERE user_id = $1`,
                [userId]
            );
            const a = existing.rows[0] || {};

            await client.query(`
                INSERT INTO student_academic (
                    user_id,
                    highest_qualification,
                    previous_institution,
                    graduation_year,
                    english_qualification,
                    english_score,
                    subjects,
                    study_level,
                    gouldings_course,
                    intended_intake,
                    updated_at
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
                ON CONFLICT (user_id)
                DO UPDATE SET
                    highest_qualification = EXCLUDED.highest_qualification,
                    previous_institution = EXCLUDED.previous_institution,
                    graduation_year = EXCLUDED.graduation_year,
                    english_qualification = EXCLUDED.english_qualification,
                    english_score = EXCLUDED.english_score,
                    subjects = EXCLUDED.subjects,
                    study_level = EXCLUDED.study_level,
                    gouldings_course = EXCLUDED.gouldings_course,
                    intended_intake = EXCLUDED.intended_intake,
                    updated_at = NOW()
            `, [
                userId,
                academic.highest_qualification !== undefined ? academic.highest_qualification : (a.highest_qualification || null),
                academic.previous_institution !== undefined ? academic.previous_institution : (a.previous_institution || null),
                academic.graduation_year !== undefined ? academic.graduation_year : (a.graduation_year || null),
                academic.english_qualification !== undefined ? academic.english_qualification : (a.english_qualification || null),
                academic.english_score !== undefined ? academic.english_score : (a.english_score || null),
                academic.subjects !== undefined ? academic.subjects : (a.subjects || null),
                academic.study_level !== undefined ? academic.study_level : (a.study_level || null),
                academic.gouldings_course !== undefined ? academic.gouldings_course : (a.gouldings_course || null),
                academic.intended_intake !== undefined ? academic.intended_intake : (a.intended_intake || null)
            ]);
        }

        // ------------------------------------------------------
        // APPLICATION — only update fields supplied by the UI
        // ------------------------------------------------------
        if (application !== undefined) {
            const existing = await client.query(
                `SELECT * FROM applications WHERE user_id = $1`,
                [userId]
            );
            const a = existing.rows[0] || {};

            await client.query(`
                INSERT INTO applications (
                    user_id,
                    status,
                    fee_amount,
                    course,
                    university,
                    destination_country,
                    intake,
                    study_level,
                    application_date,
                    assigned_staff,
                    offer_status,
                    admission_status,
                    enrollment_status,
                    notes,
                    updated_at
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
                ON CONFLICT (user_id)
                DO UPDATE SET
                    status = EXCLUDED.status,
                    fee_amount = EXCLUDED.fee_amount,
                    course = EXCLUDED.course,
                    university = EXCLUDED.university,
                    destination_country = EXCLUDED.destination_country,
                    intake = EXCLUDED.intake,
                    study_level = EXCLUDED.study_level,
                    application_date = EXCLUDED.application_date,
                    assigned_staff = EXCLUDED.assigned_staff,
                    offer_status = EXCLUDED.offer_status,
                    admission_status = EXCLUDED.admission_status,
                    enrollment_status = EXCLUDED.enrollment_status,
                    notes = EXCLUDED.notes,
                    updated_at = NOW()
            `, [
                userId,
                application.status !== undefined ? application.status : (a.status || "pending"),
                application.fee_amount !== undefined ? Number(application.fee_amount) || 0 : Number(a.fee_amount) || 0,
                application.course !== undefined ? application.course : (a.course || null),
                application.university !== undefined ? application.university : (a.university || null),
                application.destination_country !== undefined ? application.destination_country : (a.destination_country || null),
                application.intake !== undefined ? application.intake : (a.intake || null),
                application.study_level !== undefined ? application.study_level : (a.study_level || null),
                application.application_date !== undefined ? application.application_date : (a.application_date || null),
                application.assigned_staff !== undefined ? application.assigned_staff : (a.assigned_staff || null),
                application.offer_status !== undefined ? application.offer_status : (a.offer_status || null),
                application.admission_status !== undefined ? application.admission_status : (a.admission_status || null),
                application.enrollment_status !== undefined ? application.enrollment_status : (a.enrollment_status || null),
                application.notes !== undefined ? application.notes : (a.notes || null)
            ]);
        }

        await client.query(`
            INSERT INTO student_activity (
                user_id,
                activity_type,
                description,
                performed_by
            )
            VALUES ($1,$2,$3,$4)
        `, [
            userId,
            "profile_updated",
            "Student profile updated by administrator.",
            req.user?.email || "Administrator"
        ]);

        await client.query("COMMIT");

        return res.json({
            success: true,
            message: "Student details updated successfully."
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("UPDATE STUDENT DETAILS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update student details."
        });
    } finally {
        client.release();
    }
}


module.exports = {
    getStudentDetails,
    updateStudentDetails
};