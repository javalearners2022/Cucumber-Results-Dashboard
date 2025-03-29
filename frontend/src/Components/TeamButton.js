import React from "react";
import { useState, useEffect } from "react";
import { fetchTeams } from "../services/api";

const TeamButton = ({ teamName, setTeamName }) => {
    const [teams, setTeams] = useState([]);
    // const teams = ["Default", "Predict", "Consolidation", "Integration", "Platform"];
    useEffect(() => {
        const getTeams = async () => {
            try {
                let teamList = await fetchTeams();
                // Filter out null values
                teamList = teamList.filter(teamItem =>teamItem.team && (teamItem.team !== null));
                let teamNameList = ["Default"];
                for( let item of teamList){
                    teamNameList.push(item.team);
                }
                console.log(teamNameList);
                setTeams(teamNameList);
            } catch (error) {
                console.error("Error fetching teams:", error);
                setTeams([]);
            }
        };

        getTeams();
    }, []);

    return (
        <>
            {teams.map(team => (
                <button
                    key={team}
                    className={teamName === team ? "teamNameSelected" : "teamName"}
                    onClick={() => setTeamName(team)}
                >
                    {team === "Default" ? "All" : team}
                </button>
            ))}
        </>
    );
};

export default TeamButton;