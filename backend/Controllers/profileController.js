const User = require('../Models/User');
const path = require('path');
const fs = require('fs');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already in use
    if (email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone || user.phone;

    await user.save();
    
    // Send back user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert image to Base64
    const imageData = req.file.buffer.toString('base64');

    // Update user's profile picture
    user.profilePicture = {
      data: imageData,
      contentType: req.file.mimetype
    };

    await user.save();

    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: `data:${user.profilePicture.contentType};base64,${user.profilePicture.data}`
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
};

// Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear profile picture
    user.profilePicture = null;
    await user.save();

    res.json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ message: 'Error deleting profile picture' });
  }
};


//Handles user profile updates and retrieval.
// This includes updating user information, uploading profile pictures, and deleting profile pictures.
// The code uses async/await for asynchronous operations and handles errors appropriately.
// It also includes validation checks for required fields and checks for existing email addresses.
// The profile picture upload functionality converts the image to Base64 format before saving it to the database.
// The delete functionality clears the profile picture from the user's record in the database.
// The code is structured to provide clear and informative error messages in case of failures.
// It also includes console logging for debugging purposes, which can be helpful during development.
// The code is designed to be part of a larger Express.js application, where it would be used in conjunction with other controllers and middleware.
// The code is modular, allowing for easy integration into a larger codebase.
// The code is designed to be part of a larger Express.js application, where it would be used in conjunction with other controllers and middleware.