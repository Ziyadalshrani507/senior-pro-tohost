const express = require('express');
const router = express.Router();
const { getHotels, getHotelById, createHotel, updateHotel, deleteHotel } = require('../Controllers/hotelController');

// Public routes
router.get('/', getHotels);
router.get('/:id', getHotelById);

// Admin routes
router.post('/', createHotel);
router.put('/:id', updateHotel); // Update a hotel
router.delete('/:id', deleteHotel); // Delete a hotel

module.exports = router;