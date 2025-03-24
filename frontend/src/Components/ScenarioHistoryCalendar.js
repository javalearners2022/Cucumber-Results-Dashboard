import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import "../styles/ScenarioHistory.css" // Ensure proper styling

const ScenarioHistoryCalendar = ({ history }) => {
    const [dateStatuses, setDateStatuses] = useState([]);

    useEffect(() => {
      // Convert history array into an array of objects with pass/fail percentages
      const processedHistory = history.map(({ execution_date, passed, failed }) => ({
        date: execution_date.split("T")[0], // Extract YYYY-MM-DD
        passed,
        failed,
      }));
  
      setDateStatuses(processedHistory);
    }, [history]);
  
    return (
      <div className="history-grid-container">
        <h3>Execution History (Last 30 Days)</h3>
        <div className="history-grid">
          {dateStatuses.map(({ date, passed, failed }) => (
            <div key={date} className="history-box">
              <div className="bar">
                <div className="pass-bar" style={{ width: `${passed}%` }}></div>
                <div className="fail-bar" style={{ width: `${failed}%` }}></div>
              </div>
              <div className="date-label">{date}</div>
              <div className="percentage-label">✅ {passed}% <br/> ❌ {failed}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
export default ScenarioHistoryCalendar;
