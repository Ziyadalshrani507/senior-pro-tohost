const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Account not registered' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send email with reset token
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Your password reset code is: ${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password reset code sent to email' });
  } catch (error) {
    console.error('Error requesting password reset:', error); // Log the error
    res.status(500).json({ message: 'Error requesting password reset', error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};