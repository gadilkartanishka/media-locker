const express = require("express");
const pool = require("./db");
const authRoutes = require("./routes/auth");
const { server } = require("./db/s3");
const mediaRoutes = require("./routes/media");
const walletRoutes = require("./routes/wallet");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/wallet", walletRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Media Locker API is running" });
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("DB connection error", err);
  else console.log("DB connected at", res.rows[0].now);
});
server
  .run()
  .then(() => console.log("S3rver running on port 4568"))
  .catch((err) => console.error("S3rver error:", err));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
