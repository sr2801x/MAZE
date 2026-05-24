const nodemailer = require("nodemailer");

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null; // Return null if SMTP not configured
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendOtpEmail({ to, otp }) {
  // Log OTP to console for development
  console.log(`📧 OTP for ${to}: ${otp} (expires in 10 minutes)`);

  const transport = createTransport();
  if (!transport) {
    console.log("⚠️ SMTP not configured, OTP logged to console only");
    return; // Don't throw error, just log
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  try {
    await transport.sendMail({
      from,
      to,
      subject: "Your MAZE login code",
      text: `Your MAZE login code is: ${otp}\n\nIt expires in 10 minutes.`,
      html: `
        <div style="font-family: ui-sans-serif, system-ui; line-height:1.5">
          <h2>MAZE login code</h2>
          <p>Your one-time code is:</p>
          <div style="font-size:24px;font-weight:700;letter-spacing:4px">${otp}</div>
          <p style="color:#666">Expires in 10 minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send email:", error.message);
    // Don't throw error, OTP is already logged to console
  }
}

module.exports = { sendOtpEmail };

