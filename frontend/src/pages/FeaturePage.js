import React, { useState, useEffect } from "react";
import { fetchFeaturesWithScenariosByDate } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/FeaturePage.css";
import NoData from "../Components/NoData";

const FeaturePage = ({ selectedDate, setSelectedDate, teamName: team }) => {
    const [features, setFeatures] = useState([]);
    const [expandedFeature, setExpandedFeature] = useState(null);
    const [filteredFeatures, setFilteredFeatures] = useState([]); // Store filtered data

    // Filter states
    const [featureFilter, setFeatureFilter] = useState("");
    const [testIdFilter, setTestIdFilter] = useState("");
    const [scenarioFilter, setScenarioFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("Both"); // Passed, Failed, or Both

    const navigate = useNavigate();

    useEffect(() => {
        const loadFeatures = async () => {
            try {
                const data = await fetchFeaturesWithScenariosByDate(selectedDate, team);
                setFeatures(Array.isArray(data) ? data : []);
                setFilteredFeatures(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching features:", error);
                setFeatures([]);
                setFilteredFeatures([]);
            }
        };
        loadFeatures();
    }, [selectedDate, team]);

    // Function to handle feature expansion
    const toggleFeature = (fid) => {
        setExpandedFeature(expandedFeature === fid ? null : fid);
    };

    // Function to handle scenario click
    const handleScenarioClick = (testId) => {
        navigate(`/scenario/${testId}`);
    };

    // Function to filter features and scenarios
    useEffect(() => {
        let filteredData = features.map((feature) => {
            // Check if feature name matches (if filter is not empty)
            const matchesFeature = featureFilter
                ? feature.feature_name.toLowerCase().includes(featureFilter.toLowerCase())
                : true;

            // Filter scenarios based on testId, scenario name, and status
            let matchingScenarios = feature.scenarios.filter((scenario) => {
                const matchesTestId = testIdFilter
                    ? scenario.testId.toString().includes(testIdFilter)
                    : true;

                const matchesScenario = scenarioFilter
                    ? scenario.name.toLowerCase().includes(scenarioFilter.toLowerCase())
                    : true;

                const matchesStatus =
                    statusFilter === "Both" ||
                    (statusFilter === "Passed" && scenario.status === "PASSED") ||
                    (statusFilter === "Failed" && scenario.status === "FAILED");

                return matchesTestId && matchesScenario && matchesStatus;
            });

            // Only include the feature if it matches feature name or has matching scenarios
            if (matchesFeature && (matchingScenarios.length > 0 || (!testIdFilter && !scenarioFilter))) {
                return { ...feature, scenarios: matchingScenarios };
            } else {
                return null; // Exclude the feature if it doesn’t match
            }
        });

        // Remove null entries (features that don’t match any filter)
        setFilteredFeatures(filteredData.filter(Boolean));
    }, [featureFilter, testIdFilter, scenarioFilter, statusFilter, features]);

    return (
        <div className="feature-page">
            <h2>Feature Execution Results</h2>

            {/* Filters Section */}
            <div className="filters">
                <h4>Filter By</h4>
                <input
                    type="text"
                    placeholder="Feature Name"
                    value={featureFilter}
                    onChange={(e) => setFeatureFilter(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Test ID"
                    value={testIdFilter}
                    onChange={(e) => setTestIdFilter(e.target.value)}
                    className="input-testId"
                />
                <input
                    type="text"
                    placeholder="Scenario Name"
                    value={scenarioFilter}
                    onChange={(e) => setScenarioFilter(e.target.value)}
                />

                {/* Passed/Failed Filter Dropdown */}
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="Both">Both Passed & Failed</option>
                    <option value="Passed">Only Passed</option>
                    <option value="Failed">Only Failed</option>
                </select>
            </div>

            {/* Features List */}
            <div className="feature-list">
                {filteredFeatures.map((feature) => (
                    <div key={feature.fid} className="feature-item">
                        <div className="feature-header" onClick={() => toggleFeature(feature.fid)}>
                            <h3>{feature.feature_name}</h3>
                            <p className="total-scenarios">Total Scenarios: {feature.total_scenarios}</p>
                            <p className="passed">✅ Passed: {feature.passed_scenarios}</p>
                            <p className="failed">❌ Failed: {feature.failed_scenarios}</p>
                        </div>

                        {/* Dropdown for Scenarios */}
                        {expandedFeature === feature.fid && feature.scenarios.length > 0 && (
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
                {features.length === 0 && (
                    <NoData iconWidth={100} message={"No Data available"}/>
                )}
            </div>
        </div>
    );
};

export default FeaturePage;
