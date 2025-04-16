// routes/journal.js
const express = require("express");
const { Op } = require("sequelize");
const Journal = require("../models/Journal");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

// Create a new journal entry (requires login)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, date, location, journalEntry, photos, tags } = req.body;
    if (!title || !date || !location || !journalEntry) {
      return res.status(400).json({
        message: "Title, date, location and journal entry are required.",
      });
    }

    const newJournal = await Journal.create({
      title,
      date,
      location,
      journalEntry,
      photos: photos || [],
      tags: tags || [],
      userId: req.user.id, // set from the token
    });
    res.status(201).json(newJournal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update a journal entry (requires login & ownership)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const journal = await Journal.findByPk(req.params.id);
    if (!journal)
      return res.status(404).json({ message: "Journal not found." });
    if (journal.userId !== req.user.id)
      return res
        .status(403)
        .json({ message: "You are not allowed to update this journal." });

    const { title, date, location, journalEntry, photos, tags } = req.body;
    await journal.update({ title, date, location, journalEntry, photos, tags });
    res.json(journal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete a journal entry (requires login & ownership)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const journal = await Journal.findByPk(req.params.id);
    if (!journal)
      return res.status(404).json({ message: "Journal not found." });
    if (journal.userId !== req.user.id)
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this journal." });

    await journal.destroy();
    res.json({ message: "Journal deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get all journal entries for the authenticated user
router.get("/user", authenticateToken, async (req, res) => {
  try {
    // Use the user ID from the decoded JWT (set by the auth middleware)
    const userJournals = await Journal.findAll({
      where: { userId: req.user.id },
    });
    res.json(userJournals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get all journal entries
router.get("/", async (req, res) => {
  try {
    const journals = await Journal.findAll();
    res.json(journals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get the 3 most recent journal entries (ordered by date descending)
router.get("/recent", async (req, res) => {
  try {
    const recentJournals = await Journal.findAll({
      order: [["date", "DESC"]],
      limit: 3,
    });
    res.json(recentJournals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Search journals based on tags (query parameter: ?tags=tag1,tag2)
router.get("/search/tags", async (req, res) => {
  try {
    const tags = req.query.tags;
    if (!tags)
      return res
        .status(400)
        .json({ message: "Tags query parameter required." });
    // Split the comma-separated tags into an array
    const tagArray = tags.split(",");
    const journals = await Journal.findAll({
      where: {
        tags: { [Op.overlap]: tagArray }, // PostgreSQL overlap operator for arrays
      },
    });
    res.json(journals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Search journals based on title (case-insensitive search using query parameter: ?title=someText)
router.get("/search/title", async (req, res) => {
  try {
    const title = req.query.title;
    if (!title)
      return res
        .status(400)
        .json({ message: "Title query parameter required." });
    const journals = await Journal.findAll({
      where: {
        title: { [Op.iLike]: `%${title}%` },
      },
    });
    res.json(journals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
