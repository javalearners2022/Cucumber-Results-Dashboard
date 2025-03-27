import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import "../styles/ScenarioHistory.css";
import ErrorBox from "./ErrorBox"; // Import new error component
import { fetchErrorDetails } from "../services/api"; // Import API function

const ScenarioHistoryCalendar = ({ history, testId }) => {
  const [dateStatuses, setDateStatuses] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isErrorBoxOpen, setIsErrorBoxOpen] = useState(false);

  useEffect(() => {
    const processedHistory = history.map(({ execution_date, passed, failed }) => ({
      date: execution_date.split("T")[0],
      passed,
      failed,
    }));

    setDateStatuses(processedHistory);
  }, [history, testId]);

  const handleHistoryClick = async (date) => {
    try {
      const response = await fetchErrorDetails(testId, date);
      if (response.data && response.data.length > 0) {
        console.log(response.data);
        setErrors(response.data);
        setIsErrorBoxOpen(true);
      } else {
        alert("No errors found for this test on this date.");
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      alert("Failed to fetch error details.");
    }
  };

  return (
    <div className="history-grid-container">
      <h3>Execution History (Last 30 Days)</h3>
      <div className="history-grid">
        {dateStatuses.map(({ date, passed, failed }) => (
          <div key={date} className="history-box" onClick={() => handleHistoryClick(date)}>
            <div className="bar">
              <div className="pass-bar" style={{ width: `${passed}%` }}></div>
              <div className="fail-bar" style={{ width: `${failed}%` }}></div>
            </div>
            <div className="date-label">{date}</div>
            <div className="percentage-label">✅ {passed}% <br /> ❌ {failed}%</div>
          </div>
        ))}
      </div>

      {isErrorBoxOpen && <ErrorBox errors={errors} onClose={() => setIsErrorBoxOpen(false)} />}
      <div className={isErrorBoxOpen?"dull-background":""}></div>
    </div>
  );
};

export default ScenarioHistoryCalendar;
