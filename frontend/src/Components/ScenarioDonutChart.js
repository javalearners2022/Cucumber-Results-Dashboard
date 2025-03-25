import React, { useEffect, useState } from "react";
import { fetchScenariosByDate } from "../services/api";
import DoughnutChart from "./DoughnutChart";
import "../styles/ScenarioDonutChart.css";

const ScenarioDonutChart = ({ date, team }) => {
  const [scenarioDataToday, setScenarioDataToday] = useState({ passed: 0, failed: 0 });
  const [scenarioDataYesterday, setScenarioDataYesterday] = useState({ passed: 0, failed: 0 });

  useEffect(() => {
    const fetchScenarioData = async (targetDate, setScenarioData) => {
      try {
        const response = await fetchScenariosByDate(targetDate, team);
        const scenarios = response.data;

        const passed = scenarios.filter((s) => s.status === "PASSED").length;
        const failed = scenarios.filter((s) => s.status === "FAILED").length;

        setScenarioData({ passed, failed });
      } catch (error) {
        console.error(`Error fetching scenarios for ${targetDate}:`, error);
      }
    };

    // Fetch today's data
    fetchScenarioData(date, setScenarioDataToday);

    // Calculate yesterday's date
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split("T")[0];

    // Fetch yesterday's data
    fetchScenarioData(formattedYesterday, setScenarioDataYesterday);
  }, [date,team]);

  return (
    <div className="scenario-chart-container">
      <div className="scenario-chart">
        <h3 className="chart-title">Scenario Test Results: <span className="scenario-chart-day">Yesterday</span></h3>
        <DoughnutChart passed={scenarioDataYesterday.passed} failed={scenarioDataYesterday.failed} />
      </div>
      <div className="scenario-chart">
        <h3 className="chart-title">Scenario Test Results: <span className="scenario-chart-day">Today</span></h3>
        <DoughnutChart passed={scenarioDataToday.passed} failed={scenarioDataToday.failed} />
      </div>
    </div>
  );
};

export default ScenarioDonutChart;
