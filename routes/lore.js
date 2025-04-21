// routes/lore.js
const express = require("express");
const { Op } = require("sequelize");
const Lore = require("../models/Lore");
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new lore (requires login)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, location, type, content, image } = req.body;

    // Validate required fields
    if (!title || !location || !type || !content || !image) {
      return res.status(400).json({
        message: "Title, location, type, content, and image are required.",
      });
    }

    // Validate lore type
    if (!["Historical", "Cultural", "Folklore"].includes(type)) {
      return res.status(400).json({
        message: "Type must be one of: Historical, Cultural, Folklore",
      });
    }

    // Create the new lore
    const newLore = await Lore.create({
      title,
      location,
      type,
      content,
      image,
      userId: req.user.id,
    });

    // Fetch the newly created lore with the associated user
    const loreWithUser = await Lore.findByPk(newLore.id, {
      include: [
        {
          model: User,
          as: "creator", // Specify the alias used in the association
          attributes: ["username"], // Include only the fields you need
        },
      ],
    });

    res.status(201).json(loreWithUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get all lores (no login required)
router.get("/", async (req, res) => {
  try {
    const lores = await Lore.findAll({
      include: [
        {
          model: User,
          as: "creator", // Specify the alias used in the association
          attributes: ["username"], // Include only the fields you need
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(lores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get lores by type
router.get("/type/:type", async (req, res) => {
  try {
    const { type } = req.params;
    if (!["Historical", "Cultural", "Folklore"].includes(type)) {
      return res.status(400).json({
        message: "Invalid type. Must be one of: Historical, Cultural, Folklore",
      });
    }

    const lores = await Lore.findAll({
      where: { type },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(lores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get a specific lore by ID (no login required)
router.get("/:id", async (req, res) => {
  try {
    const lore = await Lore.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });
    if (!lore) {
      return res.status(404).json({ message: "Lore not found." });
    }
    res.json(lore);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update a lore (requires login & ownership)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const lore = await Lore.findByPk(req.params.id);
    if (!lore) {
      return res.status(404).json({ message: "Lore not found." });
    }
    if (lore.userId !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update this lore.",
      });
    }

    const { title, location, type, content, image } = req.body;

    // Validate required fields
    if (!title || !location || !type || !content) {
      return res.status(400).json({
        message: "Title, location, type, and content are required.",
      });
    }

    // Validate lore type
    if (!["Historical", "Cultural", "Folklore"].includes(type)) {
      return res.status(400).json({
        message: "Type must be one of: Historical, Cultural, Folklore",
      });
    }

    await lore.update({
      title,
      location,
      type,
      content,
      ...(image && { image }), // Only update image if provided
    });

    // Get updated lore with user data
    const updatedLore = await Lore.findByPk(lore.id, {
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    res.json(updatedLore);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete a lore (requires login & ownership)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const lore = await Lore.findByPk(req.params.id);
    if (!lore) {
      return res.status(404).json({ message: "Lore not found." });
    }
    if (lore.userId !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this lore.",
      });
    }

    await lore.destroy();
    res.json({ message: "Lore deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Search lores
router.get("/search/:term", async (req, res) => {
  try {
    const { term } = req.params;
    const lores = await Lore.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${term}%` } },
          { location: { [Op.iLike]: `%${term}%` } },
          { content: { [Op.iLike]: `%${term}%` } },
        ],
      },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(lores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
