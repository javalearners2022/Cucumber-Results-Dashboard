import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchScenarioDetails, fetchScenarioExecutions, fetchScenarioHistory } from "../services/api"; // Fetch scenario details API
import ScenarioHistoryCalendar from "../Components/ScenarioHistoryCalendar";
import Navbar from "../Components/Navbar";
import StepDetails from "../Components/StepDetails";
const ScenarioPage = () => {
    const navigate = useNavigate();
    const { testId:tid } = useParams(); // Get scenario ID from URL
    const [scenario, setScenario] = useState(null);
    const [testId, setTestId] = useState(tid);
    const [value, setValue] = useState(testId);
    const [executions, setExecutions] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today
    const [histsoryData,setHistoryData] = useState({history:[],overallPass30:0,overallPass7:0});
    
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
            // console.log(data);
            setScenario(data);
            const historyDataVal = await fetchScenarioHistory(testId);
            setHistoryData(historyDataVal);

        };
        loadScenario();
    }, [testId]);

    useEffect(() => {
        const getExecutions = async () => {
            const data = await fetchScenarioExecutions(testId, selectedDate);
            setExecutions(data);
        };
        getExecutions();
    }, [testId, selectedDate]);

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
            <input
                style={{marginRight:"10px" }}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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
            <p><strong>Last 30 days Pass%:</strong> {histsoryData.overallPass30}</p>
            <p><strong>Last 7 days Pass%:</strong> {histsoryData.overallPass7}</p>
            
            </div>
            <StepDetails scenarioExecutions={executions} />
            <ScenarioHistoryCalendar 
                history={histsoryData.history}
                testId={testId}
            />

        </div>
    );
};

export default ScenarioPage;
