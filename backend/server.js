require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./config/db");

const authRoutes =
require("./routes/authRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://gouldingsglobalacademy.com",
    "https://icm-website-test.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json());

app.use(
  "/api/auth",
  authRoutes
);

app.get("/", (req, res) => {
  res.send(
    "Student Portal Backend Running"
  );
});

const PORT =
process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});