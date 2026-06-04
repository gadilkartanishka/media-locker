const express = require("express");
const app = express();
const pool = require("./db");
app.use(express.json());
const PORT = process.env.PORT || 3000;
pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("DB connection error", err);
  else console.log("DB connected at", res.rows[0].now);
});
app.get("/", (req, res) => {
  res.json({ message: "Media locker API running" });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
