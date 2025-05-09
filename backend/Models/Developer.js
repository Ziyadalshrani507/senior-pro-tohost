const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const developerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  photo: {
    type: String,  // This will store the path to the uploaded photo
    default: ''
  },
  major: {
    type: String,
    required: [true, 'Major is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Developer', developerSchema);

//  Defines the schema for developer profiles or information.
//Hotel.js: Defines the schema for hotels (e.g., name, location, amenities).

// : The schema includes fields for user reference, photo, major, description, skills, and timestamps.