const Developer = require('../Models/Developer');
const User = require('../Models/User');
const fs = require('fs');
const path = require('path');

// Get all developers
exports.getDevelopers = async (req, res) => {
  try {
    const developers = await Developer.find()
      .populate('user', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 });

    res.json(developers);
  } catch (error) {
    console.error('Error fetching developers:', error);
    res.status(500).json({ message: 'Unable to fetch developers at this time' });
  }
};

// Get a single developer by ID
exports.getDeveloperById = async (req, res) => {
  try {
    const developer = await Developer.findById(req.params.id)
      .populate('user', 'firstName lastName email profilePicture');
    
    if (!developer) {
      return res.status(404).json({ message: 'Developer not found' });
    }
    
    res.json(developer);
  } catch (error) {
    console.error('Error fetching developer:', error);
    res.status(500).json({ message: 'Error fetching developer' });
  }
};

// Get developer profile by user ID
exports.getDeveloperByUser = async (req, res) => {
  try {
    const developer = await Developer.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email profilePicture');
    
    if (!developer) {
      return res.status(404).json({ message: 'Developer profile not found' });
    }
    
    res.json(developer);
  } catch (error) {
    console.error('Error fetching developer profile:', error);
    res.status(500).json({ message: 'Error fetching developer profile' });
  }
};

// Create or update developer profile
exports.createUpdateDeveloper = async (req, res) => {
  try {
    // Add explicit check for admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators can create or update developer profiles.' 
      });
    }

    const { major, description, skills } = req.body;
    
    // Check if developer profile already exists
    let developer = await Developer.findOne({ user: req.user._id });
    
    if (developer) {
      // Update existing profile
      developer.major = major || developer.major;
      developer.description = description || developer.description;
      developer.skills = skills || developer.skills;
      developer.updatedAt = Date.now();
      
      await developer.save();
      
      return res.json(developer);
    } else {
      // Create new profile
      developer = new Developer({
        user: req.user._id,
        major,
        description,
        skills: skills || [],
      });
      
      await developer.save();
      
      return res.status(201).json(developer);
    }
  } catch (error) {
    console.error('Error creating/updating developer profile:', error);
    res.status(500).json({ message: 'Error creating/updating developer profile' });
  }
};

// Upload developer photo
exports.uploadDeveloperPhoto = async (req, res) => {
  try {
    // Add explicit check for admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators can upload developer photos.' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get developer profile
    const developer = await Developer.findOne({ user: req.user._id });
    
    if (!developer) {
      // Delete the uploaded file if developer not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Developer profile not found' });
    }
    
    // Delete old photo if exists
    if (developer.photo) {
      const oldPhotoPath = path.join(__dirname, '..', developer.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    
    // Update with new photo path
    developer.photo = '/uploads/developers/' + req.file.filename;
    await developer.save();
    
    res.json({
      message: 'Photo uploaded successfully',
      photo: developer.photo
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Error uploading photo' });
  }
};

// Manages developer PAGE