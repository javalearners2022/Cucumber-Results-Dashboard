import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <h2 style={styles.logo}>Test Execution Dashboard</h2>
      <ul style={styles.navLinks}>
        <li>
          <Link to="/" style={styles.link}>Dashboard</Link>
        </li>
        <li>
          <Link to="/compare" style={styles.link}>Compare</Link>
        </li>
        <li>
          <Link to="/view" style={styles.link}>View</Link>
        </li>
      </ul>
    </nav>
  );
};

// Simple inline styles
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    padding: "10px 20px",
    color: "white",
  },
  logo: {
    margin: 0,
    fontSize: "1.5rem",
  },
  navLinks: {
    listStyle: "none",
    display: "flex",
    gap: "15px",
    padding: 0,
  },
  link: {
    textDecoration: "none",
    color: "white",
    fontSize: "1rem",
  },
};

export default Navbar;
