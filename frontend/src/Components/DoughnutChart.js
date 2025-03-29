import React from "react";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import NoData from "./NoData";
// Register required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const DoughnutChart = ({ passed, failed, noDataIconSize=100 }) => {
  const data = {
    labels: ["Passed", "Failed"],
    datasets: [
      {
        data: [passed, failed],
        backgroundColor: ["#3bbf59", "#fc3246"], // Green for Passed, Red for Failed
        hoverBackgroundColor: ["#218838", "#c82333"],
      },
    ],
  };

  const options = {
    plugins: {
      legend: { position: "bottom" },
      datalabels: {
        color: "#fff",
        font: { size: 8, weight: "bold" },
        formatter: (value) => value, // Show actual count
      },
    },
  };

  return (
    <>
      {passed+failed===0 ? <NoData message={"No Data available"} iconWidth={noDataIconSize}/> : <Doughnut data={data} options={options} />}
    </>
  );
};

export default DoughnutChart;
