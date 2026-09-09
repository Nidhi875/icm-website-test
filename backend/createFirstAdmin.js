require("dotenv").config();

const bcrypt = require("bcryptjs");
const readline = require("readline");
const pool = require("./config/db");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter admin name: ", (name) => {

    rl.question("Enter admin email: ", (email) => {

        rl.question("Enter admin password: ", async (password) => {

            try {

                const passwordHash =
                    await bcrypt.hash(password, 10);

                const result = await pool.query(
                    `
                    INSERT INTO staff
                    (name, email, password_hash, role)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id, name, email, role
                    `,
                    [
                        name.trim(),
                        email.trim().toLowerCase(),
                        passwordHash,
                        "Administrator"
                    ]
                );

                console.log("\nFIRST ADMIN CREATED:");
                console.log(result.rows[0]);

            } catch (error) {

                console.error(
                    "\nFAILED TO CREATE ADMIN:",
                    error.message
                );

            } finally {

                await pool.end();
                rl.close();

            }
        });
    });
});