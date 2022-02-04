// Setup environment variables
require("dotenv").config();

// setup app
const app = require("express")();
const { _404, _500 } = require("express-error-middlewares");

// Only allow the main domain for production use and localhost for development
app.use(require("cors")({ origin: "*" }));

// middleware to add http headers
app.use(require("helmet")());

// Base URL and also the Health probe to check if server is up without running any other logic
app.get("/", (req, res) => res.status(200).send("DNS Notes API"));

// Authentication Middleware applied for all routes defined after this line
app.use(
  require("firebase-auth-express-middleware").authn(
    require("@enkeldigital/firebase-admin").auth
  )
);

app.use("/note", require("./routes/note.js"));

// Mount the 404 and 500 error handling middleware last
app.use(_404);
app.use(_500);

/**
 * @notice Setup PORT last to ensure all setup is done before server starts listening to traffic
 */
const port = process.env.PORT || 3000; // Defaults to PORT 3000
app.listen(port, () => console.log(`Server running on port: ${port}`));
