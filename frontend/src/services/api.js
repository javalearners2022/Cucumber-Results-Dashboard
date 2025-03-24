import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Backend URL

export const fetchFeatures = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/features`);
    return response.data;
  } catch (error) {
    console.error("Error fetching features:", error);
    return [];
  }
};

// Fetch features by date
export const fetchFeaturesByDate = async (date) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/features/date`, {
      params: { date },
    });
    // console.log(response);
    return response;
  } catch (error) {
    console.error("Error fetching features by date:", error);
    return [];
  }
};

// Fetch scenarios by date
export const fetchScenariosByDate = async (date) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/scenarios/date`, {
      params: { date },
    });
    return response;
  } catch (error) {
    console.error("Error fetching scenarios by date:", error);
    return [];
  }
};


export const fetchTeams = async () => {
  try {
      const response = await axios.get(`${API_BASE_URL}/features/teams`);
      return response.data;
  } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
  }
};

export const fetchVersions = async (team) => {
  try {
      const response = await axios.get(`${API_BASE_URL}/features/versions?team=${team}`);
      return response.data;
  } catch (error) {
      console.error('Error fetching versions:', error);
      return [];
  }
};

export const fetchEnvironments = async (team, version) => {
  try {
      const response = await axios.get(`${API_BASE_URL}/features/environments?team=${team}&version=${version}`);
      return response.data;
  } catch (error) {
      console.error('Error fetching environments:', error);
      return [];
  }
};

export const fetchFeatureComparison = async (team, version, environment) => {
  try {
      const response = await axios.get(`http://localhost:5000/api/features/unique-features`, {
          params: { team, version, environment }
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching feature comparison data:", error);
      return null;
  }
};


export const fetchDailyRuns = async () => {
  try {
      const response = await fetch("http://localhost:5000/api/scenarios/daily-runs");
      return await response.json();
  } catch (error) {
      console.error("Error fetching daily runs:", error);
      return [];
  }
};


export const fetchFeaturesWithScenariosByDate = async (date) => {
  try {
      const response = await axios.get(`${API_BASE_URL}/features/with-scenarios?date=${date}`);
      return response.data;
  } catch (error) {
      console.error("Error fetching features by date:", error);
      return []; // Return empty array on error to avoid .map() crash
  }
};

export const fetchScenarioDetails = async (testId) => {
  try {
      const response = await axios.get(`http://localhost:5000/api/scenarios/${testId}`);
      return response.data;
  } catch (error) {
      console.error("Error fetching scenario details:", error);
      return null; // Return null to handle errors gracefully
  }
};
