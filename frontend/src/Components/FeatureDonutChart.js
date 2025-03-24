import React, { useEffect, useState } from "react";
import { fetchFeaturesByDate } from "../services/api";
import DoughnutChart from "./DoughnutChart";

const FeatureDonutChart = ({ date }) => {
  const [featureData, setFeatureData] = useState({ passed: 0, failed: 0 });

  useEffect(() => {
    const fetchFeatureData = async () => {
      try {
        const response = await fetchFeaturesByDate(date);
        const features = response.data;

        const passed = features.filter((f) => f.status === "PASSED").length;
        const failed = features.filter((f) => f.status === "FAILED").length;

        setFeatureData({ passed, failed });
      } catch (error) {
        console.error("Error fetching features:", error);
      }
    };

    fetchFeatureData();
  }, [date]);

 

  return (
    <div>
      <h3>Feature Test Results</h3>
      <DoughnutChart
        passed={featureData.passed}
        failed={featureData.failed}
      /> 
    </div>
  );
};

export default FeatureDonutChart;
