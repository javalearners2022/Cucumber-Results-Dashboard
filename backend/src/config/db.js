const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "testdb",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections
  queueLimit: 0,
});

// Test the connection using async/await
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database connected successfully");
    connection.release(); // Release the connection
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
})();

module.exports = pool; // Export as promise-based for async/await usage
