const app = require('./src/app'); // Import the app
const PORT = process.env.PORT || 5000;
const cors = require("cors");

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
