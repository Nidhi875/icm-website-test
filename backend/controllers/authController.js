const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.register = async (req, res) => {
  try {
    const { fullName, email, studentId, password } = req.body;

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (full_name,email,student_id,password)
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
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

    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const user = result.rows[0];

    const match =
      await bcrypt.compare(
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

exports.forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Email not found"
      });
    }

    const user = result.rows[0];

    const resetToken =
      crypto.randomBytes(32).toString("hex");

    const expiry =
      new Date(Date.now() + 3600000);

    await pool.query(
      `
      UPDATE users
      SET reset_token=$1,
          reset_token_expiry=$2
      WHERE id=$3
      `,
      [
        resetToken,
        expiry,
        user.id
      ]
    );

    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;


      const transporter =
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `
      <h2>Password Reset</h2>
      <p>Click below to reset your password:</p>

      <a href="${resetLink}">
        Reset Password
      </a>
      `
    });

    res.json({
      message: "Reset email sent"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }
};

exports.resetPassword = async (req, res) => {
  try {

    const { token, password } = req.body;

    const result =
      await pool.query(
        `
        SELECT *
        FROM users
        WHERE reset_token=$1
        AND reset_token_expiry > NOW()
        `,
        [token]
      );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired token"
      });
    }

    const user = result.rows[0];

    const hashed =
      await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE users
      SET password=$1,
          reset_token=NULL,
          reset_token_expiry=NULL
      WHERE id=$2
      `,
      [
        hashed,
        user.id
      ]
    );

    res.json({
      message: "Password updated successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }
};