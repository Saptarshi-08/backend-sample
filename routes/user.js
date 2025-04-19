// routes/user.js
const express = require("express");
const { Op } = require("sequelize");
const User = require("../models/User");
const Journal = require("../models/Journal");
const Postcard = require("../models/Postcard");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "username",
        "email",
        "location",
        "profilePicture",
        "coverImage",
        "countriesVisited",
        "description",
        "createdAt",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const stats = {
      journalEntries: await Journal.count({ where: { userId: user.id } }),
      postcardsSent: await Postcard.count({ where: { senderId: user.id } }),
      loresSaved: 8, // Replace with actual logic if needed
      countriesVisited: user.countriesVisited.length,
    };

    res.json({ ...user.toJSON(), stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// PATCH /user/role — change the current user's role
router.patch("/role", authenticateToken, async (req, res) => {
  const { role } = req.body;
  if (!["REGULARS", "PROFESSIONALS", "NATIVES"].includes(role)) {
    return res.status(400).json({ message: "Invalid role." });
  }
  try {
    const user = await User.findByPk(req.user.id);
    await user.update({ role });
    res.json({ message: "Role updated.", role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// PATCH /user — update any of the user’s profile fields
router.patch("/", authenticateToken, async (req, res) => {
  const {
    location,
    description,
    profilePicture,
    coverImage,
    countriesVisited,
  } = req.body;
  const updates = {};
  if (location !== undefined) updates.location = location;
  if (description !== undefined) updates.description = description;
  if (profilePicture !== undefined) updates.profilePicture = profilePicture;
  if (coverImage !== undefined) updates.coverImage = coverImage;
  if (Array.isArray(countriesVisited))
    updates.countriesVisited = countriesVisited;

  try {
    const user = await User.findByPk(req.user.id);
    await user.update(updates);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /user/destinations — list all countries the user has visited
router.get("/destinations", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ countriesVisited: user.countriesVisited });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /user/destinations/recent — get the 3 most recent countries visited
router.get("/destinations/recent", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const recent = user.countriesVisited.slice(-3).reverse();
    res.json({ recentDestinations: recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
