import React, { useState } from "react";
// import StepTrendAnalysis from "./StepTrendAnalysis";
import "../styles/StepDetails.css";

const StepDetails = ({ scenarioExecutions }) => {
    const [expandedExecution, setExpandedExecution] = useState(null);
    const [selectedStep, setSelectedStep] = useState(null);

    const toggleExecution = (sid) => {
        setExpandedExecution(expandedExecution === sid ? null : sid);
        setSelectedStep(null); // Reset step when execution is toggled
    };

    const toggleStep = (step) => {
        setSelectedStep(selectedStep?.step_index === step.step_index ? null : step);
    };

    return (
        <div className="step-details-container">
            <h2>Scenario Execution Details</h2>
            {scenarioExecutions.length === 0 ? (
                <p className="no-data">No Executions Available</p>
            ) : (
                scenarioExecutions.map((execution) => (
                    <div key={execution.sid} className="execution-card">
                        <div
                            className="execution-header"
                            onClick={() => toggleExecution(execution.sid)}
                        >
                            <h3>Execution ID: {execution.sid}</h3>
                            <p><strong>Status:</strong> {execution.status}</p>
                            <p><strong>Executed At:</strong> {new Date(execution.featureTimestamp).toLocaleString()}</p>
                        </div>

                        {expandedExecution === execution.sid && (
                            <div className="step-list">
                                {execution.steps.map((step) => (
                                    <div key={step.step_index}>
                                        <div
                                            className={`step-item ${step.status === "passed" ? "step-passed" : "step-failed"}`}
                                            onClick={() => toggleStep(step)}
                                        >
                                            <p><strong>{step.keyword}</strong> {step.name}</p>
                                        </div>

                                        {/* Show trend analysis just below the clicked step */}
                                        {selectedStep?.step_index === step.step_index && (
                                            <div className="trend-container">
                                                <h3>Step Trend Analysis</h3>
                                                <p><strong>Step:</strong> {step.name}</p>
                                                <p><strong>Keyword:</strong> {step.keyword}</p>
                                                <p><strong>Status:</strong> {step.status}</p>
                                                {step.status==="failed" && <p><strong>Error:</strong> {step.errorMessage}</p>}
                                                {/* Later, we will add trend analysis logic here */}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default StepDetails;
