// Setup environment variables
require("dotenv").config();

import "./UnexhaustiveCaseError";

import express from "express";
import { _404, _500 } from "express-error-middlewares";

const app = express();

// Only allow the main domain for production use and localhost for development
app.use(require("cors")({ origin: "*" }));

// middleware to add http headers
app.use(require("helmet")());

// Base URL and also the Health probe to check if server is up without running any other logic
app.get("/", (_, res) => res.status(200).send("DNS Notes API"));

// Authentication Middleware applied for all routes defined after this line
app.use(
  require("firebase-auth-express-middleware").authn(
    require("@enkeldigital/firebase-admin").auth
  )
);

app.use("/note", require("./routes/note.js"));
app.use("/user", require("./routes/user"));
app.use("/org", require("./routes/org.js"));
app.use("/error", require("./routes/error.js"));

// Mount the 404 and 500 error handling middleware last
app.use(_404);
app.use(_500);

// Setup PORT last to ensure all setup is done before server starts listening to traffic
const port = process.env.PORT || 3000; // Defaults to PORT 3000
app.listen(port, () => console.log(`Server running on port: ${port}`));

process.on("uncaughtException", (e) => console.error("Uncaught Exception!", e));
