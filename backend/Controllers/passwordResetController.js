const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configure Nodemailer with more detailed options and error handling
const setupTransporter = () => {
  // Check if email credentials are available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Warning: EMAIL_USER or EMAIL_PASS environment variables are not set');
  }
  
  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true, // Enable debug logs
    logger: true // Log information about the email sending process
  });
};

const transporter = setupTransporter();

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
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key_for_dev', { expiresIn: '1h' });

    // Send email with reset token
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Your password reset code is: ${resetToken}`,
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Please use the following token to reset your password:</p>
        <p style="background-color: #f4f4f4; padding: 10px; font-family: monospace; word-break: break-all;">${resetToken}</p>
        <p>This token will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `
    };

    console.log('Attempting to send password reset email to:', email);
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.response);
      res.json({ message: 'Password reset code sent to email' });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      
      // For development purposes, still return success but with token in response
      // In production, you should remove this and properly configure email
      if (process.env.NODE_ENV !== 'production') {
        res.json({ 
          message: 'Email sending failed, but for development, here is your token',
          resetToken: resetToken // Only include this for development!
        });
      } else {
        throw emailError; // Re-throw for production environments
      }
    }
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Error requesting password reset', error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'fallback_secret_key_for_dev');

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
    console.error('Error resetting password:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};


// Manages password reset requests and logic.