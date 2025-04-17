// routes/postcard.js
const express = require("express");
const Postcard = require("../models/Postcard");
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");
const { sendPostcardEmail } = require("../services/brevoService");

const router = express.Router();

/**
 * POST /postcards
 * Create & send a new postcard
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      message,
      location,
      backgroundImage,
      fontStyle,
      stamp,
      recipient, // this must match recipient's username
    } = req.body;

    // 1) Basic validation
    if (
      !message ||
      !location ||
      !backgroundImage ||
      !fontStyle ||
      !stamp ||
      !recipient
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 2) Find recipient user
    const recipientUser = await User.findOne({
      where: { username: recipient },
    });
    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    // 3) Create postcard record
    const pc = await Postcard.create({
      message,
      location,
      backgroundImage,
      fontStyle,
      stamp,
      senderId: req.user.id,
      recipientId: recipientUser.id,
    });

    // 4) Send email to recipient
    await sendPostcardEmail(recipientUser.email, {
      backgroundImage,
      message,
      location,
      fontStyle,
      stamp,
    });

    res.status(201).json(pc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * GET /postcards/sent
 * List all postcards sent by the authenticated user
 */
router.get("/sent", authenticateToken, async (req, res) => {
  try {
    const sent = await Postcard.findAll({
      where: { senderId: req.user.id },
      include: [
        {
          model: User,
          as: "recipient",
          attributes: ["id", "username", "email"],
        },
      ],
    });
    res.json(sent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * GET /postcards/received
 * List all postcards received by the authenticated user
 */
router.get("/received", authenticateToken, async (req, res) => {
  try {
    const received = await Postcard.findAll({
      where: { recipientId: req.user.id },
      include: [
        { model: User, as: "sender", attributes: ["id", "username", "email"] },
      ],
    });
    res.json(received);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
