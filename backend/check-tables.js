require("dotenv").config();

const pool = require("./config/db");

async function checkUserTable() {
    try {
        const columns = await pool.query(`
            SELECT
                column_name,
                data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'User'
            ORDER BY ordinal_position
        `);

        console.log("\nCOLUMNS IN User TABLE:\n");
        console.table(columns.rows);

        const users = await pool.query(`
            SELECT *
            FROM "User"
            LIMIT 10
        `);

        console.log("\nSAMPLE User RECORDS:\n");
        console.table(users.rows);

    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkUserTable();