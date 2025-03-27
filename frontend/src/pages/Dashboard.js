import React, { useEffect, useState } from "react";
import { fetchFeatures } from "../services/api";
// import FeatureDonutChart from "../Components/FeatureDonutChart";
import ScenarioDonutChart from "../Components/ScenarioDonutChart";
import Navbar from "../Components/Navbar";
import DailyScenarioRuns from "../Components/DailyScenarioRuns";
import FeaturePage from "./FeaturePage";
import "../styles/Common.css";
import TeamButton from "../Components/TeamButton";

const Dashboard = () => {
  const [features, setFeatures] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today
  const [teamName, setTeamName] = useState("Default");
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
        &nbsp;  Select Date: &nbsp;  
        <input
          style={{marginRight:"10px" }}
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <span>
          <TeamButton teamName={teamName} setTeamName={setTeamName}/>
        </span>
      </div>
      
      
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {/* <FeatureDonutChart date={selectedDate} team={teamName}/> */}
        <ScenarioDonutChart date={selectedDate} team={teamName}/>
      </div>
      <FeaturePage  
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        teamName={teamName}
      />
      <br/><br/><br/><br/><br/>
      <DailyScenarioRuns teamName={teamName}/>
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
