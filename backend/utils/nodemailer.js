const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if SMTP credentials are provided
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('--------------------------------------------------');
    console.log(`[SMTP MOCK LOG] Email would be sent to: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.text || options.html}`);
    console.log('--------------------------------------------------');
    return { mock: true, message: 'Email logged to console (no SMTP config)' };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Send message
  const message = {
    from: `${process.env.SMTP_FROM || 'noreply@collegeportal.edu'}`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  const info = await transporter.sendMail(message);
  console.log(`Message sent: ${info.messageId}`);
  return info;
};

// Template generators
const getNewClaimEmail = (founderName, claimantName, itemTitle, claimAnswer) => {
  return {
    subject: `New Claim Request for "${itemTitle}"`,
    html: `
      <h2>Hello ${founderName},</h2>
      <p>A student (<strong>${claimantName}</strong>) has claimed the item <strong>"${itemTitle}"</strong> that you posted on the College Lost & Found Portal.</p>
      <p><strong>Security Question Answer:</strong></p>
      <blockquote style="background-color: #f3f4f6; padding: 10px; border-left: 4px solid #3b82f6;">
        "${claimAnswer}"
      </blockquote>
      <p>Please log in to your dashboard to Approve or Reject this claim request.</p>
      <br/>
      <p>Best regards,<br/>College Lost & Found Team</p>
    `
  };
};

const getClaimStatusEmail = (claimantName, itemTitle, status, founderName) => {
  const isApproved = status.toLowerCase() === 'approved';
  return {
    subject: `Claim Request ${status}: "${itemTitle}"`,
    html: `
      <h2>Hello ${claimantName},</h2>
      <p>Your claim request for the item <strong>"${itemTitle}"</strong> has been <strong>${status.toUpperCase()}</strong> by the founder (${founderName}).</p>
      ${
        isApproved
          ? `<p>Please contact the founder to arrange a safe meeting to pick up your belonging. Congratulations!</p>`
          : `<p>If you believe this was an error, you can check the details or contact the administration.</p>`
      }
      <br/>
      <p>Best regards,<br/>College Lost & Found Team</p>
    `
  };
};

module.exports = {
  sendEmail,
  getNewClaimEmail,
  getClaimStatusEmail
};
