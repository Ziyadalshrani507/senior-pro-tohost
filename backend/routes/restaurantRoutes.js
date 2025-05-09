const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getRestaurants,
    getCities,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getSchemaOptions,
    searchRestaurants
} = require('../Controllers/restaurantController');

// Public routes
router.get('/', getRestaurants);
router.get('/cities', getCities);
router.get('/schema-options', getSchemaOptions);
router.get('/search', searchRestaurants);
router.get('/:id', getRestaurantById);

// Protected admin routes
router.post('/', protect, admin, createRestaurant);
router.put('/:id', protect, admin, updateRestaurant);
router.delete('/:id', protect, admin, deleteRestaurant);

module.exports = router;


// Endpoints for restaurant management.
// This includes creating, updating, deleting, and fetching restaurants.
// It also includes search functionality and schema options for restaurant attributes.
//
// Handles restaurant-related operations (CRUD, listing, etc.).