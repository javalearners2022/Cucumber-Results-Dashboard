import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import TeamButton from "../Components/TeamButton";

const View = () => {
    const [teamName, setTeamName] = useState("Default");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today
    

    useEffect(() => {
        console.log("Current team:", teamName);
    }, [teamName]); // Runs when team value changes

    return (
        <div>
            <Navbar/>
            <br/>
            <div>
                &nbsp;  Select Date: &nbsp;  
                <input
                style={{marginRight:"10px" }}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                />
                <span>
                <TeamButton teamName={teamName} setTeamName={setTeamName}/>
                </span>
            </div>
            <div>
                <br/>
                &nbsp;&nbsp;
                <button>Do RCA</button>
            </div>
            
            

        </div>
    );
};

export default View;
