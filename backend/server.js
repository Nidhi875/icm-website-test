const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const goalsRoutes = require("./routes/goalsRoutes");
const studentsRoutes = require("./routes/studentsRoutes");
const teamPerformanceRoutes = require("./routes/teamPerformanceRoutes");
const staffPresenceRoutes = require("./routes/staffPresenceRoutes");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const staffAuthRoutes = require("./routes/staffAuthRoutes");

const app = express();
app.use(helmet());
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later."
  }
});

app.use(limiter);

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://www.gouldings.education",
    "https://gouldings.education"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffAuthRoutes);
app.use("/api/staff/presence", staffPresenceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/team-performance", teamPerformanceRoutes);

app.get("/", (req, res) => {
 res.send("Gouldings LMS Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});