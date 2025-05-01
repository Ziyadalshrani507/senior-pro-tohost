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
    required: true
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
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

const Itinerary = mongoose.model("Itinerary", itinerarySchema);

module.exports = Itinerary;
