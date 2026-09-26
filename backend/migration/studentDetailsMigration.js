const pool = require("../config/db");

async function ensureStudentDetailsTables() {

    // =========================================================
    // PERSONAL / PROFILE
    // =========================================================

    await pool.query(`
        CREATE TABLE IF NOT EXISTS student_profiles (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

            preferred_name TEXT,
            phone TEXT,
            whatsapp_number TEXT,

            date_of_birth DATE,
            gender TEXT,
            nationality TEXT,

            address TEXT,
            city TEXT,
            country TEXT,

            emergency_contact_name TEXT,
            emergency_contact_phone TEXT,
            emergency_contact_relationship TEXT,

            profile_photo_url TEXT,

            account_status TEXT NOT NULL DEFAULT 'Active',
            last_login TIMESTAMPTZ,

            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);


    // =========================================================
    // ACADEMIC INFORMATION
    // =========================================================

    await pool.query(`
        CREATE TABLE IF NOT EXISTS student_academic (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

            highest_qualification TEXT,
            previous_institution TEXT,
            graduation_year INTEGER,

            english_qualification TEXT,
            english_score TEXT,

            subjects TEXT,
            study_level TEXT,

            gouldings_course TEXT,
            intended_intake TEXT,

            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);


    // =========================================================
    // APPLICATION EXTRA FIELDS
    // =========================================================

    await pool.query(`
        ALTER TABLE applications

        ADD COLUMN IF NOT EXISTS course TEXT,
        ADD COLUMN IF NOT EXISTS university TEXT,
        ADD COLUMN IF NOT EXISTS destination_country TEXT,
        ADD COLUMN IF NOT EXISTS intake TEXT,
        ADD COLUMN IF NOT EXISTS study_level TEXT,
        ADD COLUMN IF NOT EXISTS application_date TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS assigned_staff TEXT,
        ADD COLUMN IF NOT EXISTS offer_status TEXT,
        ADD COLUMN IF NOT EXISTS admission_status TEXT,
        ADD COLUMN IF NOT EXISTS enrollment_status TEXT,
        ADD COLUMN IF NOT EXISTS notes TEXT
    `);


    // =========================================================
    // DOCUMENTS
    // =========================================================

    await pool.query(`
        CREATE TABLE IF NOT EXISTS student_documents (
            id SERIAL PRIMARY KEY,

            user_id INTEGER NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,

            document_type TEXT NOT NULL,
            document_name TEXT,

            file_url TEXT,

            verification_status TEXT NOT NULL DEFAULT 'Uploaded',

            rejection_reason TEXT,

            uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            verified_at TIMESTAMPTZ,

            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);


    // =========================================================
    // PAYMENTS
    // =========================================================

    await pool.query(`
        CREATE TABLE IF NOT EXISTS student_payments (
            id SERIAL PRIMARY KEY,

            user_id INTEGER NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,

            payment_type TEXT NOT NULL,

            amount NUMERIC(12,2) NOT NULL DEFAULT 0,

            currency TEXT NOT NULL DEFAULT 'GBP',

            payment_status TEXT NOT NULL DEFAULT 'Pending',

            payment_date TIMESTAMPTZ,

            payment_method TEXT,

            transaction_id TEXT,

            invoice_url TEXT,

            receipt_url TEXT,

            notes TEXT,

            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);


    // =========================================================
    // MESSAGES
    // =========================================================

    await pool.query(`
        CREATE TABLE IF NOT EXISTS student_messages (
            id SERIAL PRIMARY KEY,

            user_id INTEGER NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,

            sender_type TEXT NOT NULL,

            sender_name TEXT,

            message TEXT NOT NULL,

            is_internal BOOLEAN NOT NULL DEFAULT FALSE,

            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);


    // =========================================================
    // ACTIVITY LOG
    // =========================================================

    await pool.query(`
        CREATE TABLE IF NOT EXISTS student_activity (
            id SERIAL PRIMARY KEY,

            user_id INTEGER NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,

            activity_type TEXT NOT NULL,

            description TEXT,

            performed_by TEXT,

            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);


    // =========================================================
    // INDEXES
    // =========================================================

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_student_documents_user
        ON student_documents(user_id)
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_student_payments_user
        ON student_payments(user_id)
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_student_messages_user
        ON student_messages(user_id)
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_student_activity_user
        ON student_activity(user_id)
    `);

    console.log("Student Details tables ready.");
}


module.exports = {
    ensureStudentDetailsTables
};

