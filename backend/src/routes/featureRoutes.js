const express = require('express');
const pool = require('../config/db'); // Import MySQL connection
const router = express.Router();

// Route to get all features
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM features'); // Query database
    res.json(rows); // Send data as JSON response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching features', error: error.message });
  }
});


// API to get features by date
router.get("/date", async (req, res) => {
  try {
    const { date } = req.query; // Get the date from query parameters
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const query = "SELECT * FROM features WHERE DATE(timestamp) = ?";
    const [rows] = await pool.query(query, [date]);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching features:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// API to fetch all unique teams
router.get("/teams", async (req, res) => {
  try {
    const query = "SELECT DISTINCT team FROM features";
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API to fetch all unique versions for a selected team
router.get("/versions", async (req, res) => {
  try {
    const { team } = req.query; // Get team from query parameters
    if (!team) {
      return res.status(400).json({ error: "Team is required" });
    }

    const query = "SELECT DISTINCT version FROM features WHERE team = ?";
    const [rows] = await pool.query(query, [team]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching versions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API to fetch all unique environments based on selected team and version
router.get("/environments", async (req, res) => {
  try {
    const { team, version } = req.query; // Get team and version from query parameters
    if (!team || !version) {
      return res.status(400).json({ error: "Both team and version are required" });
    }

    const query = "SELECT DISTINCT environment FROM features WHERE team = ? AND version = ?";
    const [rows] = await pool.query(query, [team, version]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching environments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// API to fetch unique features with pass% and fail% along with scenario counts
router.get("/unique-features", async (req, res) => {
  try {
    const { team, version, environment } = req.query;

    if (!team || !version || !environment) {
      return res.status(400).json({ error: "Team, version, and environment are required" });
    }

    const query = `
      SELECT 
        f.featureId,
        f.name,
        (SELECT COUNT(*) FROM features f2 WHERE f2.featureId = f.featureId AND f2.team = f.team AND f2.version = f.version AND f2.environment = f.environment) AS run_count,
        COUNT(DISTINCT s.sid) AS total_scenarios,
        SUM(CASE WHEN s.status = 'PASSED' THEN 1 ELSE 0 END) AS passed_scenarios,
        SUM(CASE WHEN s.status = 'FAILED' THEN 1 ELSE 0 END) AS failed_scenarios,
        (SUM(CASE WHEN f.status = 'PASSED' THEN 1 ELSE 0 END) / COUNT(f.fid)) * 100 AS pass_percentage,
        (SUM(CASE WHEN f.status = 'FAILED' THEN 1 ELSE 0 END) / COUNT(f.fid)) * 100 AS fail_percentage
      FROM features f
      LEFT JOIN scenarios s ON f.fid = s.fid
      WHERE f.team = ? AND f.version = ? AND f.environment = ?
      GROUP BY f.featureId, f.name
    `;


    const [rows] = await pool.query(query, [team, version, environment]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching unique features:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get('/with-scenarios', async (req, res) => {
  try {
      const { date } = req.query;
      if (!date) {
          return res.status(400).json({ error: "Date parameter is required" });
      }

      // Fetch features with scenario counts
      const featureQuery = `
          SELECT 
              f.fid,
              f.name AS feature_name,
              COUNT(s.sid) AS total_scenarios,
              SUM(CASE WHEN s.status = 'PASSED' THEN 1 ELSE 0 END) AS passed_scenarios,
              SUM(CASE WHEN s.status = 'FAILED' THEN 1 ELSE 0 END) AS failed_scenarios
          FROM features f
          LEFT JOIN scenarios s ON f.fid = s.fid
          WHERE DATE(f.timestamp) = ?
          GROUP BY f.fid, f.name
      `;

      const [features] = await pool.query(featureQuery, [date]);

      // Fetch all scenarios for the given date
      const scenarioQuery = `
          SELECT 
              s.fid,
              s.sid,
              s.name AS scenario_name,
              s.testId,
              s.status
          FROM scenarios s
          JOIN features f ON s.fid = f.fid
          WHERE DATE(f.timestamp) = ?
      `;

      const [scenarios] = await pool.query(scenarioQuery, [date]);

      // Map scenarios under their respective features
      const featureMap = {};
      features.forEach(feature => {
          featureMap[feature.fid] = {
              ...feature,
              scenarios: []
          };
      });

      scenarios.forEach(scenario => {
          if (featureMap[scenario.fid]) {
              featureMap[scenario.fid].scenarios.push({
                  sid: scenario.sid,
                  name: scenario.scenario_name,
                  testId: scenario.testId,
                  status: scenario.status
              });
          }
      });

      res.json(Object.values(featureMap)); // Convert mapped features back to array
  } catch (error) {
      console.error("Error fetching features with scenarios:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;
