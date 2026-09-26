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

        const applicationResult = await pool.query(`
            SELECT *
            FROM applications
            WHERE user_id = $1
        `, [userId]);

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

        profile = {},

        academic = {},

        application = {}
    } = req.body;


    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // ------------------------------------------------------
        // USER
        // ------------------------------------------------------

        await client.query(`
            UPDATE users
            SET
                full_name = $1,
                email = $2,
                updated_at = NOW()
            WHERE id = $3
        `, [
            full_name,
            email,
            userId
        ]);


        // ------------------------------------------------------
        // PROFILE
        // ------------------------------------------------------

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
            VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,NOW()
            )

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
                emergency_contact_relationship =
                    EXCLUDED.emergency_contact_relationship,
                profile_photo_url = EXCLUDED.profile_photo_url,
                account_status = EXCLUDED.account_status,
                updated_at = NOW()
        `, [
            userId,
            profile.preferred_name || null,
            profile.phone || null,
            profile.whatsapp_number || null,
            profile.date_of_birth || null,
            profile.gender || null,
            profile.nationality || null,
            profile.address || null,
            profile.city || null,
            profile.country || null,
            profile.emergency_contact_name || null,
            profile.emergency_contact_phone || null,
            profile.emergency_contact_relationship || null,
            profile.profile_photo_url || null,
            profile.account_status || "Active"
        ]);


        // ------------------------------------------------------
        // ACADEMIC
        // ------------------------------------------------------

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
            VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()
            )

            ON CONFLICT (user_id)
            DO UPDATE SET

                highest_qualification =
                    EXCLUDED.highest_qualification,

                previous_institution =
                    EXCLUDED.previous_institution,

                graduation_year =
                    EXCLUDED.graduation_year,

                english_qualification =
                    EXCLUDED.english_qualification,

                english_score =
                    EXCLUDED.english_score,

                subjects =
                    EXCLUDED.subjects,

                study_level =
                    EXCLUDED.study_level,

                gouldings_course =
                    EXCLUDED.gouldings_course,

                intended_intake =
                    EXCLUDED.intended_intake,

                updated_at = NOW()
        `, [
            userId,
            academic.highest_qualification || null,
            academic.previous_institution || null,
            academic.graduation_year || null,
            academic.english_qualification || null,
            academic.english_score || null,
            academic.subjects || null,
            academic.study_level || null,
            academic.gouldings_course || null,
            academic.intended_intake || null
        ]);


        // ------------------------------------------------------
        // APPLICATION
        // ------------------------------------------------------

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
            VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,
                COALESCE($9,NOW()),
                $10,$11,$12,$13,$14,NOW()
            )

            ON CONFLICT (user_id)
            DO UPDATE SET

                status = EXCLUDED.status,
                fee_amount = EXCLUDED.fee_amount,
                course = EXCLUDED.course,
                university = EXCLUDED.university,
                destination_country =
                    EXCLUDED.destination_country,
                intake = EXCLUDED.intake,
                study_level = EXCLUDED.study_level,
                application_date =
                    EXCLUDED.application_date,
                assigned_staff =
                    EXCLUDED.assigned_staff,
                offer_status =
                    EXCLUDED.offer_status,
                admission_status =
                    EXCLUDED.admission_status,
                enrollment_status =
                    EXCLUDED.enrollment_status,
                notes =
                    EXCLUDED.notes,
                updated_at = NOW()
        `, [
            userId,
            application.status || "pending",
            Number(application.fee_amount) || 0,
            application.course || null,
            application.university || null,
            application.destination_country || null,
            application.intake || null,
            application.study_level || null,
            application.application_date || null,
            application.assigned_staff || null,
            application.offer_status || null,
            application.admission_status || null,
            application.enrollment_status || null,
            application.notes || null
        ]);


        // ------------------------------------------------------
        // ACTIVITY
        // ------------------------------------------------------

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