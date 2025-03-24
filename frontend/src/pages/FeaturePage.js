import React, { useState, useEffect } from "react";
import { fetchFeaturesWithScenariosByDate } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/FeaturePage.css";


const FeaturePage = ({selectedDate,setSelectedDate}) => {
    const [features, setFeatures] = useState([]);
    const [expandedFeature, setExpandedFeature] = useState(null);
    // const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

    const navigate = useNavigate();
    const handleScenarioClick = (testId) => {
        navigate(`/scenario/${testId}`);
    };    

    useEffect(() => {
        const loadFeatures = async () => {
            try {
                const data = await fetchFeaturesWithScenariosByDate(selectedDate);
                setFeatures(Array.isArray(data) ? data : []); // Ensure data is an array
                console.log(data);
            } catch (error) {
                console.error("Error fetching features:", error);
                setFeatures([]); // Fallback to empty array on error
            }
        };
        loadFeatures();
    }, [selectedDate]);

    const toggleFeature = (fid) => {
        setExpandedFeature(expandedFeature === fid ? null : fid);
    };

    return (
        <div className="feature-page">
            <h2>Feature Execution Results</h2>
            
            {/* Date Selector
            <label>Select Date:</label>
            <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="date-picker"
            /> */}

            {/* Features List */}
            <div className="feature-list">
                {features.map((feature) => (
                    <div key={feature.fid} className="feature-item">
                        <div className="feature-header" onClick={() => toggleFeature(feature.fid)}>
                            <h3>{feature.feature_name}</h3>
                            <p className="total-scenarios">Total Scenarios: {feature.total_scenarios}</p>
                            <p className="passed">✅ Passed: {feature.passed_scenarios}</p>
                            <p className="failed">❌ Failed: {feature.failed_scenarios}</p>
                        </div>

                        {/* Dropdown for Scenarios */}
                        {expandedFeature === feature.fid && (
                            <div className="scenario-list">
                                {feature.scenarios.map((scenario) => (
                                    <div 
                                        key={scenario.sid} 
                                        className={scenario.status === "PASSED" ? "greenbg" : "redbg"}
                                        onClick={() => handleScenarioClick(scenario.testId)}
                                    >
                                        <p>TEST-{scenario.testId} : {scenario.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturePage;
