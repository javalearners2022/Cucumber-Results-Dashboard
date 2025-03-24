import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import ScenarioPage from "./pages/ScenarioPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/compare" element={<Compare />} />
        {/* <Route path="/scenario/test/:sid" element={<ScenarioPage />} />  */}
        <Route path="/scenario/:testId" element={<ScenarioPage />} /> 

      </Routes>
    </Router>
  );
};

export default App;
