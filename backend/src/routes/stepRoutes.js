const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // ✅ Import MySQL pool

// Get all steps
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM steps"); // ✅ Use pool.query with await
    res.json(rows);
  } catch (error) {
    console.error("Error fetching steps:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
