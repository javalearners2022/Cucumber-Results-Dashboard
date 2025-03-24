import React, { useEffect, useState } from "react";
import { fetchScenariosByDate } from "../services/api";
import DoughnutChart from "./DoughnutChart";

const ScenarioDonutChart = ({date}) => {
  const [scenarioData, setScenarioData] = useState({ passed: 0, failed: 0 });

  useEffect(() => {
    const fetchScenarioData = async () => {
      try {
        const response = await fetchScenariosByDate(date);
        const scenarios = response.data;

        const passed = scenarios.filter((s) => s.status === "PASSED").length;
        const failed = scenarios.filter((s) => s.status === "FAILED").length;

        setScenarioData({ passed, failed });
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      }
    };

    fetchScenarioData();
  }, [date]);

  

  return (
    <div>
      <h3>Scenario Test Results</h3>
      <DoughnutChart 
        passed={scenarioData.passed}
        failed={scenarioData.failed}
      />
    </div>
  );
};

export default ScenarioDonutChart;
