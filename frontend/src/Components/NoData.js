import React from "react";
import "../styles/NoData.css";
const NoData = ({iconWidth, message="No Data Available"}) => {
    return (
        <>
            <div className="no-data">
                <span className="empty-box" style={{fontSize:`${iconWidth}px`}}>📦</span>
                <p>{message}</p>
            </div>
        </>
    );
}

export default NoData;