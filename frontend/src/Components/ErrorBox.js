import React, { useState } from "react";
import "../styles/ErrorBox.css"; // Ensure proper styling

const ErrorBox = ({ errors, onClose }) => {
  const [currentErrorIndex, setCurrentErrorIndex] = useState(0);

  if (!errors || errors.length === 0) return null; // Don't render if no errors

  // Extracting the current error details
  const {
    step_index,
    stepName,
    keyword,
    stepStatus,
    errorMessage,
    timestamp,
  } = errors[currentErrorIndex];

  return (
    <div className="error-box">
    <button className="close-icon" onClick={onClose}>✖</button>
      <div className="error-content">
        <strong className="center">Error Details</strong>
        <br/>
        <span><strong>{ step_index+1 }&nbsp;</strong><strong>{step_index===0?"Background":"Step"}:&nbsp;</strong><strong>{keyword}</strong> {stepName}</span>
        <span><strong>Error:</strong> <i>(timestamp={timestamp})</i> </span>
        <pre className="error-message">{
          errorMessage==="NA"?"Test-Step : Passed"
          :
          errorMessage.replace(/\\n/g, "\n\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\\//g,"/")
        }</pre>

        {/* Navigation for multiple errors */}
        <div className="error-navigation">
          {errors.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentErrorIndex((prev) => (prev - 1 + errors.length) % errors.length)
                }
              >
                &lt; Prev
              </button>
              <span>{currentErrorIndex + 1} of {errors.length}</span>
              <button
                onClick={() =>
                  setCurrentErrorIndex((prev) => (prev + 1) % errors.length)
                }
              >
                Next &gt;
              </button>
            </>
          )}
        </div>

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ErrorBox;
