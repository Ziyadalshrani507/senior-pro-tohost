const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  // Add a unique compound index for user and name
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  destination: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  budget: {
    type: String,
    required: true
  },
  days: [{
    activities: [{
      name: String,
      description: String,
      time: String,
      type: String
    }]
  }],
  hotel: {
    place: String,
    description: String
  },
  restaurants: [{
    name: String,
    cuisine: String,
    description: String
  }],
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  isTemporary: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add index for user field to improve query performance
itinerarySchema.index({ user: 1 });

// Add index for isTemporary and expiresAt for cleanup queries
itinerarySchema.index({ isTemporary: 1, expiresAt: 1 });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;
