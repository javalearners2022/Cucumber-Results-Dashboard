import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchScenarioDetails } from "../services/api"; // Fetch scenario details API
import ScenarioHistoryCalendar from "../Components/ScenarioHistoryCalendar";
import Navbar from "../Components/Navbar";
const ScenarioPage = () => {
    const navigate = useNavigate();
    const { testId:tid } = useParams(); // Get scenario ID from URL
    const [scenario, setScenario] = useState(null);
    const [testId, setTestId] = useState(tid);
    const [value, setValue] = useState(testId);
    const handleSearch = () => {
        if (testId.trim()) {
            setTestId(value);
            navigate(`/scenario/${value}`);
        }
    };
    console.log(testId);

    useEffect(() => {
        const loadScenario = async () => {
            console.log(testId);
            const data = await fetchScenarioDetails(testId);
            console.log(data);
            setScenario(data);
        };
        loadScenario();
    }, [testId]);

    if (!scenario) return <p>Loading scenario details...</p>;

    return (<div>
        <Navbar/>
        <div className="search-container">
            <input
                type="text"
                placeholder="Enter Test ID (xxxxx)"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
                Search
            </button>
        </div>
        <div className="scenario-container">
            <h2>Scenario Name: {scenario.name}</h2>
            <p><strong>Test ID:</strong> {scenario.testId}</p>
            <p><strong>Feature Name:</strong> {scenario.feature_name}</p>
            <p>
                <strong>Status: </strong> 
                <span 
                className={`status-badge ${scenario.status === "FAILED" ? "status-failed" : scenario.status === "PASSED" ? "status-passed" : "status-pending"}`}
                >
                {scenario.status}
                </span>
            </p>
            <p><strong>Feature ID:</strong> {scenario.fid}</p>
            
            </div>
            <ScenarioHistoryCalendar 
                history={scenario.history}
                testId={testId}
            />

        </div>
    );
};

export default ScenarioPage;
