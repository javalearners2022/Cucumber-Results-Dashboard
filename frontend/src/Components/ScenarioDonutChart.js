import React, { useEffect, useState } from "react";
import { fetchScenariosByDate } from "../services/api";
import DoughnutChart from "./DoughnutChart";
import "../styles/ScenarioDonutChart.css";

const ScenarioDonutChart = ({ date, team }) => {
  const [scenarioDataToday, setScenarioDataToday] = useState({ pass_percentage: 0, fail_percentage: 0 });
  const [scenarioDataYesterday, setScenarioDataYesterday] = useState({ pass_percentage: 0, fail_percentage: 0 });
  const [yesterday, setYesterday] = useState("");
  useEffect(() => {
    const fetchScenarioData = async (targetDate, setScenarioData) => {
      try {
        // console.log("Api called");
        const response = await fetchScenariosByDate(targetDate, team);
        const scenarios = response.data;

        const passed = scenarios.filter((s) => s.status === "PASSED").length;
        const failed = scenarios.filter((s) => s.status === "FAILED").length;
        const pass_percentage = (passed+failed)==0 ? 0 : ((passed/(passed+failed))*100).toFixed(2);
        const fail_percentage = (passed+failed)==0 ? 0 : ((failed/(passed+failed))*100).toFixed(2);
        setScenarioData({ pass_percentage, fail_percentage });
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
    setYesterday(formattedYesterday);
    // Fetch yesterday's data
    fetchScenarioData(formattedYesterday, setScenarioDataYesterday);
  }, [date,team]);

  return (
    <div className="scenario-chart-container">
      <div className="scenario-chart">
        <h3 className="chart-title">Scenario Test Results: <span className="scenario-chart-day">{date}</span></h3>
        <DoughnutChart passed={scenarioDataToday.pass_percentage} failed={scenarioDataToday.fail_percentage} />
      </div>
      <div className="scenario-chart">
        <h3 className="chart-title">Scenario Test Results: <span className="scenario-chart-day">{yesterday}</span></h3>
        <DoughnutChart passed={scenarioDataYesterday.pass_percentage} failed={scenarioDataYesterday.fail_percentage} />
      </div>
    </div>
  );
};

export default ScenarioDonutChart;
