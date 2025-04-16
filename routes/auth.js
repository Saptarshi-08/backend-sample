// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const { sendOTPEmail } = require("../services/brevoService");

const router = express.Router();

// Utility function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /signup - register a new user, generate OTP and send email
router.post("/signup", async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    // Basic field validation
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Email, username, and password are required." });
    }

    // Check if email or username already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email or username already exists." });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP and set expiration time (10 minutes)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Create a new user with the OTP details, username and role
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
      role: role || "REGULARS",
    });

    // Send OTP email using Brevo
    await sendOTPEmail(email, otp);

    res.status(201).json({ message: "User registered. OTP sent to email." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error during signup." });
  }
});

// POST /verify-otp - verify user's OTP to complete registration
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Validate the OTP and check expiration
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }
    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "User verified successfully." });
  } catch (error) {
    console.error("OTP verification error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during OTP verification." });
  }
});

// POST /login - log in a user using either email or username
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // Validate request
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Identifier and password are required." });
    }

    // Find user by email or username
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }],
      },
    });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid identifier or password." });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your OTP before logging in." });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid identifier or password." });
    }

    // Create a JWT token for the user
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({ message: "Logged in successfully.", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login." });
  }
});

// GET /users - get all users (for admin or testing purposes)
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "isVerified", "role"],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Fetching users error:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching users." });
  }
});

module.exports = router;
