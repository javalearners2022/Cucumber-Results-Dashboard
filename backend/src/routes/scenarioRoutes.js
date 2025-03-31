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
      SELECT s.name AS scenarioName, st.step_index,
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
      return res.status(404).json({ message: "No match found for the given criteria" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching error details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/step-details/:testId/:date", async (req, res) => {
  try {
      let { testId, date } = req.params;
      console.log(`Fetching executions for testId: ${testId} on date: ${date}`);

      // Step 1: Fetch all executions (scenarios) of this testId on given date
      const scenarioQuery = `
          SELECT s.sid, s.testId, s.status, s.featureTimestamp
          FROM scenarios s
          WHERE s.testId = ? 
          AND DATE(s.featureTimestamp) = ?
          ORDER BY s.featureTimestamp DESC
      `;

      const [scenarioRows] = await pool.query(scenarioQuery, [testId, date]);

      if (scenarioRows.length === 0) {
          return res.status(404).json({ error: "No executions found for this testId on the given date" });
      }

      // Step 2: Fetch test steps for each scenario execution
      for (let scenario of scenarioRows) {
          const stepQuery = `
              SELECT step_index, name, keyword, status, errorMessage
              FROM steps
              WHERE sid = ?
              ORDER BY step_index ASC
          `;

          const [stepRows] = await pool.query(stepQuery, [scenario.sid]);
          
          // Attach steps to scenario execution
          scenario.steps = stepRows;
      }

      res.json(scenarioRows);
  } catch (error) {
      console.error("Error fetching scenario executions:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


// router.get("/:testId", async (req, res) => {
//   try {
//       let { testId } = req.params;
//       console.log(req.params);

//       // Query to get scenario details using testId
//       const scenarioQuery = `
//           SELECT s.sid, s.name, s.testId, s.status, s.fid, f.name as feature_name
//           FROM scenarios s
//           JOIN features f ON s.fid = f.fid
//           WHERE s.testId = ?
//       `;

//       const [scenarioRows] = await pool.query(scenarioQuery, [testId]);

//       if (scenarioRows.length === 0) {
//           return res.status(404).json({ error: "Scenario not found" });
//       }

//       const scenario = scenarioRows[0];

//       // Query to get last 30 days status using testId (No JOIN needed)
//       const historyQuery = `
//         SELECT s.featureTimestamp AS execution_timestamp, s.status
//         FROM scenarios s
//         WHERE s.testId = ? 
//         AND s.featureTimestamp >= NOW() - INTERVAL 30 DAY
//         ORDER BY s.featureTimestamp DESC
//       `;

//       const [historyRows] = await pool.query(historyQuery, [testId]);

//       // Process history data to calculate daily pass/fail percentages
//       const historyMap = {};

//       historyRows.forEach(({ execution_timestamp, status }) => {
//           const execution_date = new Date(execution_timestamp).toISOString().split("T")[0];

//           if (!historyMap[execution_date]) {
//               historyMap[execution_date] = { passed: 0, failed: 0, total: 0 };
//           }
          
//           historyMap[execution_date].total += 1;
//           if (status === "PASSED") {
//               historyMap[execution_date].passed += 1;
//           } else {
//               historyMap[execution_date].failed += 1;
//           }
//       });

//       // Convert history map to required format with per-day percentages
//       const history = Object.entries(historyMap).map(([date, counts]) => ({
//           execution_date: date,
//           passed: ((counts.passed / counts.total) * 100).toFixed(2), // Pass % per date
//           failed: ((counts.failed / counts.total) * 100).toFixed(2)  // Fail % per date
//       }));

//       // Add history data to the response
//       scenario.history = history;

//       res.json(scenario); // Return scenario with history
//   } catch (error) {
//       console.error("Error fetching scenario details:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//   }
// });


router.get("/history/:testId", async (req, res) => {
  try {
      let { testId } = req.params;

      // Query to get last 30 days status using testId
      const historyQuery = `
        SELECT s.featureTimestamp AS execution_timestamp, s.status
        FROM scenarios s
        WHERE s.testId = ? 
        AND s.featureTimestamp >= NOW() - INTERVAL 30 DAY
        ORDER BY s.featureTimestamp DESC
      `;

      const [historyRows] = await pool.query(historyQuery, [testId]);

      // Initialize history map and counters for overall percentages
      const historyMap = {};
      let totalPassed30 = 0, totalFailed30 = 0, total30 = 0;
      let totalPassed7 = 0, totalFailed7 = 0, total7 = 0;

      const today = new Date();
      const last7DaysDate = new Date(today);
      last7DaysDate.setDate(today.getDate() - 7);

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

          // Count for last 30 days
          total30++;
          if (status === "PASSED") totalPassed30++;
          else totalFailed30++;

          // Count for last 7 days
          if (new Date(execution_timestamp) >= last7DaysDate) {
              total7++;
              if (status === "PASSED") totalPassed7++;
              else totalFailed7++;
          }
      });

      // Convert history map to required format with per-day percentages
      const history = Object.entries(historyMap).map(([date, counts]) => ({
          execution_date: date,
          passed: ((counts.passed / counts.total) * 100).toFixed(2), // Pass % per date
          failed: ((counts.failed / counts.total) * 100).toFixed(2)  // Fail % per date
      }));

      // Calculate overall percentages
      const overallPass30 = total30 ? ((totalPassed30 / total30) * 100).toFixed(2) : "0.00";
      const overallFail30 = total30 ? ((totalFailed30 / total30) * 100).toFixed(2) : "0.00";
      const overallPass7 = total7 ? ((totalPassed7 / total7) * 100).toFixed(2) : "0.00";
      const overallFail7 = total7 ? ((totalFailed7 / total7) * 100).toFixed(2) : "0.00";

      res.json({
          history,
          overallPass30,
          overallFail30,
          overallPass7,
          overallFail7
      });

  } catch (error) {
      console.error("Error fetching scenario history:", error);
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

      res.json(scenarioRows[0]); // Return only scenario details
  } catch (error) {
      console.error("Error fetching scenario details:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});





module.exports = router;
