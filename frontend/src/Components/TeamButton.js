import React from "react";

const TeamButton = ({ teamName, setTeamName }) => {
    const teams = ["Default", "Predict", "Consolidation", "Integration", "Platform"];

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