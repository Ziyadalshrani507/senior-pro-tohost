const express = require("express");
const router = express.Router();
const { 
  generateItinerary, 
  getUserItineraries, 
  getItinerary,
  updateItinerary,
  deleteItinerary,
  saveItinerary
} = require("../Controllers/itineraryController");
const { protect } = require("../middleware/authMiddleware");

// Generate a new itinerary
router.post("/generate", generateItinerary);

// Save an itinerary to user account
router.post("/save", protect, saveItinerary);

// Get all user itineraries
router.get("/", protect, getUserItineraries);

// Get a single itinerary
router.get("/:id", protect, getItinerary);

// Update an itinerary
router.put("/:id", protect, updateItinerary);

// Delete an itinerary
router.delete("/:id", protect, deleteItinerary);

module.exports = router;
