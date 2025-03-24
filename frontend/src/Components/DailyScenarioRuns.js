import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchDailyRuns } from "../services/api";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DailyScenarioRuns = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchDailyRuns();
                
                // Extract labels (dates) and values (pass/fail counts)
                const labels = data.map(entry => entry.run_date);
                // Calculate total runs per day and percentages
                const passPercent = data.map(entry => {
                    const total = Number(entry.pass_count) + Number(entry.fail_count);
                    return total > 0 ? ((Number(entry.pass_count) / total) * 100).toFixed(2) : 0;
                });
                const failPercent = data.map(entry => {
                    const total = Number(entry.pass_count) + Number(entry.fail_count);
                    return total > 0 ? ((Number(entry.fail_count) / total) * 100).toFixed(2) : 0;
                });


                // Prepare chart data
                setChartData({
                    labels,
                    datasets: [
                        {
                            label: "Pass %",
                            data: passPercent,
                            backgroundColor: "#3bbf59",
                        },
                        {
                            label: "Fail %",
                            data: failPercent,
                            backgroundColor: "#fc3246",
                        }
                    ]
                });
            } catch (error) {
                console.error("Error fetching daily runs:", error);
            }
        };

        loadData();
    }, []);

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
        <div style={{ width: "100%", maxWidth: "700px", margin: "auto", padding: "20px" }}>
            {chartData ? <Bar data={chartData} options={options} /> : <p>Loading...</p>}
        </div>
    );
};

export default DailyScenarioRuns;
