const nodemailer = require("nodemailer");

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP configuration (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendOtpEmail({ to, otp }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const transport = createTransport();

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
}

module.exports = { sendOtpEmail };

