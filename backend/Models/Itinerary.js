const mongoose = require("mongoose");

const dayPlanSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  morning: {
    activity: { type: String },
    description: String
  },
  lunch: {
    restaurant: { type: String },
    description: String
  },
  afternoon: {
    activity: { type: String },
    description: String
  },
  dinner: {
    restaurant: { type: String },
    description: String
  },
  hotel: {
    place: { type: String },
    description: String
  },
  notes: String
});

const itinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function() {
      // User is only required if this is not a temporary itinerary
      return !this.isTemporary;
    }
  },
  name: { type: String, required: true },
  city: {
    type: String,
    required: true
  },
  duration: { type: Number, required: true },
  interests: [String],
  budget: {
    type: String,
    enum: ["Low", "Medium", "Luxury"],
    required: true
  },
  travelersType: {
    type: String,
    enum: ["Solo", "Couple", "Family", "Group"],
    required: true
  },
  days: [dayPlanSchema],
  hotel: {
    place: { type: String },
    description: String
  },
  isAIGenerated: { type: Boolean, default: true },
  isTemporary: { type: Boolean, default: false },
  expiresAt: { type: Date },
  generatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

const Itinerary = mongoose.model("Itinerary", itinerarySchema);

module.exports = Itinerary;


//Define the schema for travel itineraries (planned trips, activities, etc.).
// : The schema includes fields for user reference, name, city, duration, interests, budget, travelers type, and timestamps.
// : The itinerary can include a list of days with activities, hotels, and other details.