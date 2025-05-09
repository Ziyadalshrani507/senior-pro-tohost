const express = require('express');
const router = express.Router();
const { signup, signin, refreshToken, signout } = require('../Controllers/authController');
const { validateSignup, validateSignin } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);
router.post('/refresh-token', protect, refreshToken);
router.post('/signout', signout);

module.exports = router;

//Handles user authentication routes (sign up, sign in, sign out, etc.).
// Compare this snippet from backend/Routes/itineraryRoutes.js:
// const express = require('express');