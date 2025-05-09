const express = require('express');
const router = express.Router();
const { 
  getHotels, 
  getHotelById, 
  createHotel, 
  updateHotel, 
  deleteHotel, 
  hardDeleteHotel,
  getSchemaOptions,
  searchHotels 
} = require('../Controllers/hotelController');
const { protect: authenticateToken, admin } = require('../middleware/authMiddleware');

// Schema options route
router.get('/schema-options', getSchemaOptions);

// Public routes
router.get('/', getHotels);
router.get('/search', searchHotels);
router.get('/:id', getHotelById);

// Admin routes - protected with authentication and admin role
router.post('/', authenticateToken, admin, createHotel);
router.put('/:id', authenticateToken, admin, updateHotel);
router.delete('/:id', authenticateToken, admin, deleteHotel);

// Hard delete - special admin route with extra protection
router.delete('/:id/hard', authenticateToken, admin, hardDeleteHotel);

module.exports = router;

//Endpoints for hotel management.
// This includes creating, updating, deleting, and fetching hotels.
// It also includes search functionality and schema options for hotel attributes.
//
// Handles hotel-related operations (CRUD, listing, etc.).
