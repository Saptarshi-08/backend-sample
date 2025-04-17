// index.js
const express = require("express");
const bodyParser = require("body-parser");
const { connectDB } = require("./config/database");
const authRoutes = require("./routes/auth"); // your existing auth routes
const journalRoutes = require("./routes/journal"); // our new journal routes
const userRoutes = require("./routes/user");
const postcardRoutes = require("./routes/postcard");
const User = require("./models/User");
const Postcard = require("./models/Postcard");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const cors = require("cors");
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/", authRoutes);
app.use("/journals", journalRoutes);
app.use("/user", userRoutes);
app.use("/postcards", postcardRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Journals and Authentication API!");
});

User.hasMany(Postcard, { as: "sentPostcards", foreignKey: "senderId" });
User.hasMany(Postcard, { as: "receivedPostcards", foreignKey: "recipientId" });
Postcard.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Postcard.belongsTo(User, { as: "recipient", foreignKey: "recipientId" });

// Connect to the database and start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
  });
});
