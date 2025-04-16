// index.js
const express = require("express");
const bodyParser = require("body-parser");
const { connectDB } = require("./config/database");
const authRoutes = require("./routes/auth"); // your existing auth routes
const journalRoutes = require("./routes/journal"); // our new journal routes
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/", authRoutes);
app.use("/journals", journalRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Journals and Authentication API!");
});

// Connect to the database and start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
  });
});
