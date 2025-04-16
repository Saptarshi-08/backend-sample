// services/brevoService.js
const axios = require("axios");
require("dotenv").config();

const sendOTPEmail = async (recipientEmail, otp) => {
  // Create the email content with the OTP code
  const data = {
    sender: { email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email: recipientEmail }],
    subject: "Your OTP Code",
    htmlContent: `<p>Your OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
  };

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      data,
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("OTP email sent:", response.data);
  } catch (error) {
    console.error(
      "Error sending OTP email:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Unable to send OTP email.");
  }
};

module.exports = {
  sendOTPEmail,
};
