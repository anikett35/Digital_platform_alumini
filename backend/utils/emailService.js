const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email Skipped] EMAIL_USER or EMAIL_PASS not set in .env');
    return;
  }
  try {
    await transporter.sendMail({ from: `"AlumniConnect" <${process.env.EMAIL_USER}>`, to, subject, html });
    console.log(`✉️  Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

exports.sendVerificationApprovedEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: '✅ Your AlumniConnect verification was approved!',
    html: `<h2>Congratulations, ${user.name}!</h2>
           <p>Your alumni verification has been <strong>approved</strong>. You can now complete your profile and connect with students.</p>
           <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard" style="padding:10px 20px;background:#6366f1;color:white;border-radius:8px;text-decoration:none;">Go to Dashboard</a>`
  });

exports.sendVerificationRejectedEmail = (user, reason) =>
  sendEmail({
    to: user.email,
    subject: '❌ AlumniConnect verification update',
    html: `<h2>Hi ${user.name},</h2>
           <p>Unfortunately your verification request was <strong>rejected</strong>.</p>
           <p><strong>Reason:</strong> ${reason || 'Please contact admin for details.'}</p>`
  });

exports.sendMeetingRequestEmail = (alumni, student, topic) =>
  sendEmail({
    to: alumni.email,
    subject: `📅 New Mentorship Request from ${student.name}`,
    html: `<h2>Hi ${alumni.name},</h2>
           <p><strong>${student.name}</strong> has requested a mentorship session with you.</p>
           <p><strong>Topic:</strong> ${topic}</p>
           <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard" style="padding:10px 20px;background:#6366f1;color:white;border-radius:8px;text-decoration:none;">View Request</a>`
  });

exports.sendMeetingAcceptedEmail = (student, alumni, meetingLink, scheduledAt) =>
  sendEmail({
    to: student.email,
    subject: `🎉 Meeting Accepted by ${alumni.name}!`,
    html: `<h2>Great news, ${student.name}!</h2>
           <p><strong>${alumni.name}</strong> accepted your mentorship request.</p>
           <p><strong>Time:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
           <a href="${meetingLink}" style="padding:10px 20px;background:#6366f1;color:white;border-radius:8px;text-decoration:none;">Join Meeting</a>`
  });

exports.sendReminderEmail = (user, meetingLink, scheduledAt) =>
  sendEmail({
    to: user.email,
    subject: '⏰ Meeting reminder — Starting in 10 minutes!',
    html: `<h2>Your meeting starts in 10 minutes!</h2>
           <p><strong>Time:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
           <a href="${meetingLink}" style="padding:10px 20px;background:#6366f1;color:white;border-radius:8px;text-decoration:none;">Join Now</a>`
  });
