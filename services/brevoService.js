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

async function sendPostcardEmail(recipientEmail, postcard) {
  const { backgroundImage, message, location, fontStyle, stamp } = postcard;

  // Simple HTML email showing front/back content
  const htmlContent = `
    <h2>You’ve got a new postcard!</h2>
    <img src="${backgroundImage}" alt="Postcard front" style="max-width:600px;" /><br/>
    <p><strong>Message:</strong> <span style="font-family:${fontStyle};">${message}</span></p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Stamp:</strong> ${stamp}</p>
    <!-- You could embed a back‑image screenshot here if you send it up from the frontend -->
  `;

  const data = {
    sender: { email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email: recipientEmail }],
    subject: "You’ve received a Postcard!",
    htmlContent,
  };

  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", data, {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(
      "Error sending postcard email:",
      err.response?.data || err.message
    );
    throw new Error("Unable to send postcard email.");
  }
}

module.exports = {
  sendOTPEmail,
  sendPostcardEmail,
};
