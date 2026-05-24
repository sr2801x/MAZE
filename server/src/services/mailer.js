const nodemailer = require("nodemailer");

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log(`🔧 SMTP Config Check - Host: ${host ? '✓' : '✗'}, Port: ${port}, User: ${user ? '✓' : '✗'}, Pass: ${pass ? '✓' : '✗'}`);

  if (!host || !user || !pass) {
    console.log(`⚠️ SMTP not configured - missing credentials`);
    return null;
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  console.log(`✅ SMTP transport created successfully`);
  return transport;
}

async function sendOtpEmail({ to, otp }) {
  console.log(`📧 Attempting to send OTP email to ${to}`);
  
  const transport = createTransport();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (!transport) {
    console.log(`❌ Cannot send email - SMTP not configured`);
    return;
  }

  try {
    console.log(`📤 Sending email from ${from} to ${to}`);
    const info = await transport.sendMail({
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
    console.log(`✅ OTP email sent successfully to ${to}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Email failed for ${to}:`, error.message);
    console.error(`Full error details:`, error);
    throw error;
  }
}

module.exports = { sendOtpEmail };