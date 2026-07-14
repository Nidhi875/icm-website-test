const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "studentportal",
  password: "Nidhi@1234",
  port: 5432,
});

pool.connect()
  .then(() => {
    console.log("PostgreSQL Connected ✅");
  })
  .catch((err) => {
    console.log("PostgreSQL Error:", err);
  });

module.exports = pool;