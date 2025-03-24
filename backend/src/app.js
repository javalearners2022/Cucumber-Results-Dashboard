require('dotenv').config();
const express = require('express');
const db = require('./config/db'); // MySQL Connection
const cors = require("cors");
// Import routes
const featureRoutes = require('./routes/featureRoutes');
const scenarioRoutes = require("./routes/scenarioRoutes");
const stepRoutes = require("./routes/stepRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});


// Use routes
app.use("/api/features", featureRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/steps", stepRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('✅ Server is running...');
});



app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1+1 AS result');
    res.json({ message: 'Database connection successful', result: rows });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

module.exports = app; // Export the app
