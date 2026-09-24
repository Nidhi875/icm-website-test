
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Railway PostgreSQL usually requires SSL.
  // Adjust based on your Railway database configuration.
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

pool.query("SELECT current_database()")
  .then((result) => {
    console.log("Connected database:", result.rows[0].current_database);
  })
  .catch((err) => {
    console.error("PostgreSQL connection error:", err);
  });

module.exports = pool;