const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      studentId,
      password
    } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users
      (full_name, email, student_id, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        fullName,
        email,
        studentId,
        hashedPassword
      ]
    );

    res.status(201).json({
      message: "Registration Successful",
      user: result.rows[0]
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        message: "Wrong password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      user
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message
    });
  }
};

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);