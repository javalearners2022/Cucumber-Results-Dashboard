import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchDailyRuns } from "../services/api";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import NoData from "./NoData";
import "../styles/DailyScenarioRuns.css";
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DailyScenarioRuns = ({teamName}) => {
    const [chartData, setChartData] = useState(null);
    const [isDataAvailable,setIsDataAvailable] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchDailyRuns(teamName);
                // console.log(data);
                // Extract labels (dates) and values (pass/fail counts)
                const labels = data.map(entry => entry.run_date);
                // Calculate total runs per day and percentages
                const passPercent = data.map(entry => {
                    const total = Number(entry.pass_count) + Number(entry.fail_count);
                    return total > 0 ? ((Number(entry.pass_count) / total) * 100).toFixed(1) : 0;
                });
                const failPercent = data.map(entry => {
                    const total = Number(entry.pass_count) + Number(entry.fail_count);
                    return total > 0 ? ((Number(entry.fail_count) / total) * 100).toFixed(1) : 0;
                });
                if(passPercent.length+failPercent.length==0) setIsDataAvailable(false);
                else setIsDataAvailable(true);

                // Prepare chart data
                setChartData({
                    labels,
                    datasets: [
                        {
                            label: "Pass %",
                            data: passPercent,
                            backgroundColor: "rgba(32, 180, 27, 0.8)",
                            borderRadius: { topLeft:5, topRight:5, bottomLeft: 0, bottomRight: 0 }, // Smooth edges
                            borderSkipped: false, // Ensures all edges are rounded
                        },
                        {
                            label: "Fail %",
                            data: failPercent,
                            backgroundColor: "rgb(255, 87, 87)",
                            borderRadius: { topLeft: 5, topRight: 5, bottomLeft: 0, bottomRight: 0 }, // Smooth edges
                            borderSkipped: false, // Ensures all edges are rounded
                        }
                    ]
                });
            } catch (error) {
                console.error("Error fetching daily runs:", error);
            }
        };

        loadData();
    }, [teamName]);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Daily Scenario Runs (Last 7 Days)" }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                grid: {
                    // drawTicks: false,      // Hides tick marks
                    drawOnChartArea: false // Removes horizontal grid lines
                }
            },
            x :{
                grid: {
                    // drawTicks: false,      // Hides tick marks
                    drawOnChartArea: false // Removes horizontal grid lines
                }
            }
        }
    };

    return (
        <div className="bar-container">
            <h2 className="bar-title">Daily-runs Track</h2>
            
            {isDataAvailable ? (
                <div className="chart-wrapper">
                    {chartData ? <Bar data={chartData} options={options} /> : <p>Loading...</p>}
                </div>
            ) : (
                <NoData iconWidth={100} />
            )}
        </div>
    );
};

export default DailyScenarioRuns;
