const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendRejectionEmail({ toEmail, toName, fileTitle, reason }) {
  const mailOptions = {
    from: `"StudyHub" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `Your upload "${fileTitle}" was not approved`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f7f7fa;border-radius:12px;">
        <div style="background:#1a1a2e;padding:20px 28px;border-radius:10px;margin-bottom:24px;">
          <h1 style="color:#e8b84b;margin:0;font-size:22px;">StudyHub</h1>
        </div>
        <h2 style="color:#1a1a2e;margin:0 0 8px;">Hi ${toName},</h2>
        <p style="color:#444;line-height:1.6;">Your uploaded file <strong>"${fileTitle}"</strong> was reviewed and could not be approved.</p>
        ${reason ? `
        <div style="background:#fff;border-left:4px solid #e8b84b;padding:14px 18px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Reason</p>
          <p style="margin:8px 0 0;color:#1a1a2e;">${reason}</p>
        </div>` : ''}
        <p style="color:#444;line-height:1.6;">You're welcome to make corrections and re-upload. If you have questions, reply to this email.</p>
        <p style="color:#888;font-size:13px;margin-top:32px;">— The StudyHub Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendRejectionEmail };
