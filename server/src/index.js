const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.json({ message: "Media locker API running" });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
