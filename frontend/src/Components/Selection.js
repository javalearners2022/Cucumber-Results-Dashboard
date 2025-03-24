import React, { useState, useEffect } from 'react';
import { fetchTeams, fetchEnvironments, fetchVersions } from '../services/api';
import '../styles/Common.css';

const Selection = ({ onSelectionChange }) => {
    const [teams, setTeams] = useState([]);
    const [versions, setVersions] = useState([]);
    const [environments, setEnvironments] = useState([]);

    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedVersion, setSelectedVersion] = useState('');
    const [selectedEnvironment, setSelectedEnvironment] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchTeams();
                setTeams(data);
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };
        fetchData();
    }, []);
    
    useEffect(() => {
        const fetchVersionsData = async () => {
            if (selectedTeam) {
                try {
                    const data = await fetchVersions(selectedTeam);
                    setVersions(data);
                } catch (error) {
                    console.error('Error fetching versions:', error);
                }
            } else {
                setVersions([]);
                setSelectedVersion('');
            }
        };
        fetchVersionsData();
    }, [selectedTeam]);
    
    useEffect(() => {
        const fetchEnvironmentsData = async () => {
            if (selectedTeam && selectedVersion) {
                try {
                    const data = await fetchEnvironments(selectedTeam, selectedVersion);
                    setEnvironments(data);
                } catch (error) {
                    console.error('Error fetching environments:', error);
                }
            } else {
                setEnvironments([]);
                setSelectedEnvironment('');
            }
        };
        fetchEnvironmentsData();
    }, [selectedTeam, selectedVersion]);
    

    // Notify parent component about selection changes
    useEffect(() => {
        onSelectionChange({
            team: selectedTeam,
            version: selectedVersion,
            environment: selectedEnvironment
        });
    }, [selectedTeam, selectedVersion, selectedEnvironment, onSelectionChange]);

    return (
        <div className='selection-container'>

            <label>Team:</label>
            <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                <option value="">Select Team</option>
                {teams.map(teamObj => (
                    <option key={teamObj.team} value={teamObj.team}>{teamObj.team}</option>
                ))}
            </select>
            <br/>
            <label>Version:</label>
            <select value={selectedVersion} onChange={e => setSelectedVersion(e.target.value)} disabled={!selectedTeam}>
                <option value="">Select Version</option>
                {versions.map(versionObj => (
                    <option key={versionObj.version} value={versionObj.version}>{versionObj.version}</option>
                ))}
            </select>
            <br/>
            <label>Environment:</label>
            <select value={selectedEnvironment} onChange={e => setSelectedEnvironment(e.target.value)} disabled={!selectedVersion}>
                <option value="">Select Environment</option>
                {environments.map(envObj => (
                    <option key={envObj.environment} value={envObj.environment}>{envObj.environment}</option>
                ))}
            </select>
            <br/>
        </div>
    );
};

export default Selection;
