// index.js
const express = require("express");
const bodyParser = require("body-parser");
const { connectDB } = require("./config/database");
const authRoutes = require("./routes/auth"); // your existing auth routes
const journalRoutes = require("./routes/journal"); // our new journal routes
const userRoutes = require("./routes/user");
const postcardRoutes = require("./routes/postcard");
const loreRoutes = require("./routes/lore");
const User = require("./models/User");
const Postcard = require("./models/Postcard");
const Lore = require("./models/Lore");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const cors = require("cors");
app.use(
  cors({
    origin: [
      "https://hermesmer.vercel.app",
      "*",
      "http://localhost:3001",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/", authRoutes);
app.use("/journals", journalRoutes);
app.use("/user", userRoutes);
app.use("/postcards", postcardRoutes);
app.use("/lore", loreRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Journals and Authentication API!");
});

User.hasMany(Postcard, { as: "sentPostcards", foreignKey: "senderId" });
User.hasMany(Postcard, { as: "receivedPostcards", foreignKey: "recipientId" });
Postcard.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Postcard.belongsTo(User, { as: "recipient", foreignKey: "recipientId" });

User.hasMany(Lore, { as: "createdLore", foreignKey: "userId" });
Lore.belongsTo(User, { as: "creator", foreignKey: "userId" });

// Connect to the database and start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
  });
});
