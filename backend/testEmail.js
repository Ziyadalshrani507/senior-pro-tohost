require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send test email
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'test@example.com', // Replace with your test email
  subject: 'Test Email',
  text: 'This is a test email to verify Nodemailer configuration.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error('Error sending test email:', error);
  }
  console.log('Test email sent:', info.response);
});