const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => {
    console.log("PostgreSQL Connected ✅");
  })
  .catch((err) => {
    console.log("PostgreSQL Error:", err);
  });

module.exports = pool;

