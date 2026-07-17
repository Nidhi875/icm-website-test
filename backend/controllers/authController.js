const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const SibApiV3Sdk = require("sib-api-v3-sdk");

exports.register = async (req, res) => {
  try {

    const {
      fullName,
      email,
      studentId,
      password
    } = req.body;

    const existingUser =
      await pool.query(
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

    const result =
      await pool.query(
        `
        INSERT INTO users
        (
          full_name,
          email,
          student_id,
          password
        )
        VALUES
        (
          $1,$2,$3,$4
        )
        RETURNING *
        `,
        [
          fullName,
          email,
          studentId,
          hashedPassword
        ]
      );

    delete result.rows[0].password;

    res.status(201).json({
      message: "Registration Successful",
      user: result.rows[0]
    });

  }
  catch (error) {

    console.log(error);

    res.status(500).json({
        error: "Internal server error"
    });

  }
};



exports.login = async (
  req,
  res
) => {

  try {

    const {
      email,
      password
    } = req.body;

    const result =
      await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message:
          "Invalid credentials"
      });
    }

    const user =
      result.rows[0];

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {
      return res.status(400).json({
        message:
          "Wrong password"
      });
    }

    const token =
      jwt.sign(
        {
          id: user.id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

    delete user.password;

    res.json({
      token,
      user
    });

  }
  catch (error) {

    console.log(error);

    res.status(500).json({
       error: "Internal server error"
    });

  }
};



exports.forgotPassword =
async (
  req,
  res
) => {

  try {

    const { email } =
      req.body;

    console.log(
  "Password reset requested."
);

    const result =
      await pool.query(
        `
        SELECT *
        FROM users
        WHERE email=$1
        `,
        [email]
      );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          "Email not found"
      });
    }

    const user =
      result.rows[0];

    const resetToken =
      crypto
      .randomBytes(32)
      .toString("hex");

    const expiry =
      new Date(
        Date.now()
        + 3600000
      );

    await pool.query(
      `
      UPDATE users
      SET
      reset_token=$1,
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

   console.log(
  "Password reset email prepared."
);

    try {

      const defaultClient =
        SibApiV3Sdk
          .ApiClient
          .instance;

      defaultClient
        .authentications["api-key"]
        .apiKey =
        process.env.BREVO_API_KEY;

      const apiInstance =
        new SibApiV3Sdk
          .TransactionalEmailsApi();

      await apiInstance
        .sendTransacEmail({

          sender: {
            name:
              "Gouldings Global Academy",
            email:
              "Nidhi2437@gmail.com"
          },

          to: [
            {
              email: email
            }
          ],

          subject:
            "Reset Your Password",

          htmlContent: `
            <h2>Password Reset</h2>

            <p>
            Click below to reset your password.
            </p>

            <a
            href="${resetLink}"
            style="
              background:#002147;
              color:white;
              padding:12px 20px;
              text-decoration:none;
              border-radius:6px;
              display:inline-block;
            "
            >
            Reset Password
            </a>

            <p>
            This link expires in 1 hour.
            </p>
          `
        });

     console.log(
  "Password reset email sent."
);

      return res.json({
        message:
          "Reset email sent successfully"
      });

    }
    catch (emailError) {

      console.log(
        emailError
      );

      return res.status(500).json({
        message:
          "Email sending failed"
      });

    }

  }
  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};



exports.resetPassword =
async (
  req,
  res
) => {

  try {

    const {
      token,
      password
    } = req.body;

  

    const result =
      await pool.query(
        `
        SELECT *
        FROM users
        WHERE
        reset_token=$1
        AND
        reset_token_expiry > NOW()
        `,
        [token]
      );


console.log(
  "Password reset token verification started."
);


    if (
      result.rows.length === 0
    ) {
      return res.status(400).json({
        message:
          "Invalid or expired token"
      });
    }

    const user =
      result.rows[0];

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    await pool.query(
      `
      UPDATE users
      SET
      password=$1,
      reset_token=NULL,
      reset_token_expiry=NULL
      WHERE id=$2
      `,
      [
        hashedPassword,
        user.id
      ]
    );


    res.json({
      message:
        "Password updated successfully"
    });

  }
  catch (error) {

    console.log(error);

    res.status(500).json({
       error: "Internal server error"
    });

  }

};