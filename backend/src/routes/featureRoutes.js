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


// API to get latest features by date using RANK()
router.get("/date", async (req, res) => {
  try {
    const { date } = req.query; // Get the date from query parameters
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const query = `
      WITH RankedFeatures AS (
        SELECT *, 
               RANK() OVER (PARTITION BY featureId ORDER BY timestamp DESC) AS rnk
        FROM features 
        WHERE DATE(timestamp) = ?
      )
      SELECT * FROM RankedFeatures WHERE rnk = 1;
    `;

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


// API to get daily scenario runs for the last 7 days
router.post("/daily-runs", async (req, res) => {
  try {
      const { team: teamName } = req.body;
      console.log(teamName);
      let query = `
          WITH RankedFeatures AS (
              SELECT 
                  f.fid,
                  f.name,
                  f.team,
                  f.timestamp,
                  f.passedScenarios,
                  f.failedScenarios,
                  DATE(f.timestamp) AS run_date,  -- Extract only the date
                  RANK() OVER (PARTITION BY f.name ORDER BY f.timestamp DESC) AS feature_rank
              FROM features f
          )
          SELECT 
              DATE(run_date) AS run_date, 
              SUM(passedScenarios) AS pass_count,
              SUM(failedScenarios) AS fail_count
          FROM RankedFeatures
          WHERE run_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) -- Fix: Include last 7 days
      `;

      const queryParams = [];

      // Apply teamName filter if it's not "Default"
      if (teamName && teamName !== "Default") {
          query += ` AND team = ?`;
          queryParams.push(teamName);
      }

      query += ` GROUP BY run_date ORDER BY run_date ASC;`;

      const [rows] = await pool.query(query, queryParams);

      // console.log(rows);
      // Convert run_date to required format
      const formattedRows = rows.map(row => {
        const date = new Date(row.run_date);
        date.setDate(date.getDate() + 1); // Add 1 day
        return {
            run_date: date.toISOString().split("T")[0], // Extract only 'YYYY-MM-DD'
            pass_count: row.pass_count.toString(),
            fail_count: row.fail_count.toString(),
        };
      });
    

      res.json(formattedRows);
  } catch (error) {
      console.error("Error fetching daily scenario runs:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});




router.post('/with-scenarios', async (req, res) => {
  try {
      let { date, teamName } = req.body;
      if (!date) {
          return res.status(400).json({ error: "Date parameter is required" });
      }
      teamName = teamName==null ? "Default" : teamName;
      // Query to get the most recent feature entry per featureId for the given date
      const featureQuery = `
          SELECT f.fid, f.name AS feature_name, f.totalScenarios, f.passedScenarios, f.failedScenarios
          FROM features f
          WHERE DATE(f.timestamp) = ?
          AND f.fid = (
              SELECT MAX(f2.fid) 
              FROM features f2 
              WHERE DATE(f2.timestamp) = DATE(f.timestamp) 
              AND f2.featureId = f.featureId
          )
          ${teamName !== "Default" ? "AND f.team = ?" : ""}
      `;

      const params = teamName !== "Default" ? [date, teamName] : [date];
      const [features] = await pool.query(featureQuery, params);

      if (features.length === 0) {
          return res.json([]); // Return empty array if no data found
      }

      // Fetch all scenarios linked to the retrieved features
      const featureIds = features.map(f => f.fid);
      const scenarioQuery = `
          SELECT s.fid, s.sid, s.name AS scenario_name, s.testId, s.status
          FROM scenarios s
          WHERE s.fid IN (?)
      `;

      const [scenarios] = await pool.query(scenarioQuery, [featureIds]);

      // Map scenarios under their respective features
      const featureMap = {};
      features.forEach(feature => {
          featureMap[feature.fid] = {
              fid: feature.fid,
              feature_name: feature.feature_name,
              total_scenarios: feature.totalScenarios,
              passed_scenarios: feature.passedScenarios,
              failed_scenarios: feature.failedScenarios,
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

      res.json(Object.values(featureMap)); // Convert mapped features back to an array
  } catch (error) {
      console.error("Error fetching features with scenarios:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;
