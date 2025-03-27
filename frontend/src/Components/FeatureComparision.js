import React from "react";
import '../styles/FeatureComparision.css';
import DoughnutChart from "./DoughnutChart";
const FeatureComparison = ({ featureId, featureData1, featureData2 }) => {
  // Calculate pass & fail percentages
  const calculatePassPercentage = (feature) => {
    if (!feature) return null;
    const total = Number(feature.passed_scenarios) + Number(feature.failed_scenarios);
    return total > 0 ? ((Number(feature.passed_scenarios) / total) * 100).toFixed(2) : "0.00";
  };

  const calculateFailPercentage = (feature) => {
    if (!feature) return null;
    const total = Number(feature.passed_scenarios) + Number(feature.failed_scenarios);
    return total > 0 ? ((Number(feature.failed_scenarios) / total) * 100).toFixed(2) : "0.00";
  };

  const passPercentage1 = Number(calculatePassPercentage(featureData1));
  const failPercentage1 = Number(calculateFailPercentage(featureData1));
  const passPercentage2 = Number(calculatePassPercentage(featureData2));
  const failPercentage2 = Number(calculateFailPercentage(featureData2));

  return (
    <div className="feature-comparison">
      <h3>Feature Name: {featureData1? featureData1.name : featureData2? featureData2.name : "NA"}</h3>
      <div className="comparison-row">
        {/* Left side comparison */}
        <div className="comparison-box">
            <div className="left">
                <p>Total Runs: {featureData1 ? featureData1.run_count : "N/A"}</p>
                <p>
                    Pass %:{" "}
                    <span className={passPercentage1 > passPercentage2 ? "highlight-green" : ""}>
                    {passPercentage1}%
                    </span>
                </p>
                <p>
                    Fail %:{" "}
                    <span className={failPercentage1 > failPercentage2 ? "highlight-red" : ""}>
                    {failPercentage1}%
                    </span>
                </p>
            </div>
            <div className="right">
                <div style={{width:"150px"}}>
                    <DoughnutChart
                        passed={passPercentage1}
                        failed={failPercentage1}
                    />
                </div>
                
            </div>
          
        </div>

        {/* Right side comparison */}
        <div className="comparison-box">
            <div className="left">
                <p>Total Runs: {featureData2 ? featureData2.run_count : "N/A"}</p>
                <p>
                    Pass %:{" "}
                    <span className={passPercentage2 > passPercentage1 ? "highlight-green" : ""}>
                        {passPercentage2}%
                    </span>
                </p>
                <p>
                    Fail %:{" "}
                    <span className={failPercentage2 > failPercentage1 ? "highlight-red" : ""}>
                        {failPercentage2}%
                    </span>
                </p>
            </div>
            <div className="right">
                <div style={{width:"150px"}}>
                    <DoughnutChart
                        passed={passPercentage2}
                        failed={failPercentage2}
                        noDataIconSize={40}
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureComparison;
