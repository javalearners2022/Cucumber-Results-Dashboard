import React, { useEffect, useState } from "react";
import { fetchFeatures } from "../services/api";
import FeatureDonutChart from "../Components/FeatureDonutChart";
import ScenarioDonutChart from "../Components/ScenarioDonutChart";
import Navbar from "../Components/Navbar";
import DailyScenarioRuns from "../Components/DailyScenarioRuns";
import FeaturePage from "./FeaturePage";

const Dashboard = () => {
  const [features, setFeatures] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today

  useEffect(() => {
    const loadFeatures = async () => {
      const data = await fetchFeatures();
      setFeatures(data);
    };
    loadFeatures();
  }, []);

  return (
    <div>
      <Navbar />
      <br/>
      <div>
        Select Date &nbsp;
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <FeatureDonutChart date={selectedDate} />
        <ScenarioDonutChart date={selectedDate} />
      </div>
      <FeaturePage  
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <br/><br/><br/><br/><br/>
      <DailyScenarioRuns />
      <br/><br/><br/><br/><br/><br/><br/>
      <ul>
        {features.map((feature) => (
          <li key={feature.fid}>{feature.name} - {feature.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
