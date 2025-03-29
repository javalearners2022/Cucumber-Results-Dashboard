const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Ensure this is the MySQL2 promise-based pool

// Get all scenarios
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM scenarios"); // Fix: Await the query
    res.json(rows);
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// API to get latest scenarios by date based on their parent feature's timestamp
router.get("/date", async (req, res) => {
  try {
    const { date, team } = req.query; // Get date and team from query parameters

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    let query = `
      WITH RankedScenarios AS (
        SELECT s.*, 
               RANK() OVER (PARTITION BY s.scenarioId ORDER BY s.featureTimestamp DESC) AS rnk
        FROM scenarios s
        JOIN features f ON s.fid = f.fid
        WHERE DATE(f.timestamp) = ?
    `;

    const queryParams = [date];

    // If team is provided and it's not "Default", apply team filter
    if (team && team !== "Default") {
      query += ` AND f.team = ?`;
      queryParams.push(team);
    }

    query += `) SELECT * FROM RankedScenarios WHERE rnk = 1;`;

    const [rows] = await pool.query(query, queryParams);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/errors", async (req, res) => {
  try {
    const { testId, date } = req.query;

    if (!testId) {
      return res.status(400).json({ error: "testId is required" });
    }

    let query = `
      SELECT s.scenarioId, s.name AS scenarioName, s.status AS scenarioStatus,
             st.stepId, st.name AS stepName, st.keyword, 
             st.status AS stepStatus, st.duration, st.errorMessage, s.featureTimestamp as timestamp
      FROM scenarios s
      JOIN steps st ON s.sid = st.sid
      WHERE s.testId = ?
    `;

    const params = [testId];

    if (date) {
      query += ` AND DATE(s.featureTimestamp) = ?`;
      params.push(date);
    }


    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No errors found for the given criteria" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching error details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/:testId", async (req, res) => {
  try {
      let { testId } = req.params;
      console.log(req.params);
      // Query to get scenario details using testId
      const scenarioQuery = `
          SELECT s.sid, s.name, s.testId, s.status, s.fid, f.name as feature_name
          FROM scenarios s
          JOIN features f ON s.fid = f.fid
          WHERE s.testId = ?
      `;

      const [scenarioRows] = await pool.query(scenarioQuery, [testId]);

      if (scenarioRows.length === 0) {
          return res.status(404).json({ error: "Scenario not found" });
      }

      const scenario = scenarioRows[0];

      // Query to get last 30 days status using testId
      const historyQuery = `
        SELECT f.timestamp AS execution_timestamp, s.status
        FROM scenarios s
        CROSS JOIN features f
        WHERE f.name = ? AND s.testId = ? 
        AND f.timestamp >= NOW() - INTERVAL 30 DAY
        ORDER BY f.timestamp DESC
      `;

      const [historyRows] = await pool.query(historyQuery, [scenario.feature_name, testId]);

      // Process history data to calculate percentages
      const historyMap = {};

      historyRows.forEach(({ execution_timestamp, status }) => {
          const execution_date = new Date(execution_timestamp).toISOString().split("T")[0];

          if (!historyMap[execution_date]) {
              historyMap[execution_date] = { passed: 0, failed: 0, total: 0 };
          }
          historyMap[execution_date].total += 1;
          if (status === "PASSED") {
              historyMap[execution_date].passed += 1;
          } else {
              historyMap[execution_date].failed += 1;
          }
      });

      // Convert to required format with percentages
      const history = Object.entries(historyMap).map(([date, counts]) => ({
          execution_date: date,
          passed: ((counts.passed / counts.total) * 100).toFixed(2), // Format to 2 decimal places
          failed: ((counts.failed / counts.total) * 100).toFixed(2)
      }));

      // Add history data to the response
      scenario.history = history;

      res.json(scenario); // Return scenario with history
  } catch (error) {
      console.error("Error fetching scenario details:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});





module.exports = router;
