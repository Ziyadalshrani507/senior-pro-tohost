// Validate signup request
exports.validateSignup = (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword, gender } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword || !gender) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Email validation
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email' });
  }

  // Password validation
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  // Gender validation
  if (!['male', 'female'].includes(gender)) {
    return res.status(400).json({ message: 'Gender must be either male or female there is no third one' });
  }

  next();
};

// Validate signin request
exports.validateSignin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email' });
  }

  next();
};

// Validate activity request
exports.validateActivity = (req, res, next) => {
  const { name, description, locationCity, type, cost, categories } = req.body;

  if (!name || !description || !locationCity || !type) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  // Validate city
  const validCities = [
    "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Taif", "Tabuk",
    "Buraydah", "Khamis Mushait", "Abha", "Al Khobar", "Najran", "Hail",
    "Al Jubail", "Hofuf", "Yanbu", "Arar", "Sakakah", "Al Qatif", "Al Bahah",
    "Jazan", "Unaizah", "Zulfi", "Dhahran", "Al Majma'ah", "Rafha",
    "Al Kharj", "Bisha", "Al-Ula", "Ar Rass"
  ];
  if (!validCities.includes(locationCity)) {
    return res.status(400).json({ message: 'Invalid city' });
  }

  // Validate type
  const validTypes = [
    "Historical", "Adventure", "Cultural", "Experiences",
    "Theater and arts", "Concerts", "Sports", "Food", "Music"
  ];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid activity type' });
  }

  // Validate cost
  if (cost !== undefined && cost !== null && (isNaN(cost) || cost < 0)) {
    return res.status(400).json({ message: 'Cost must be zero or a positive number' });
  }

  // Validate categories if provided
  if (categories) {
    const validCategories = [
      "Family-friendly", "Outdoor", "Luxury", "Budget",
      "Solo-traveler", "Group-traveler", "Indoor"
    ];
    if (!Array.isArray(categories) || !categories.every(cat => validCategories.includes(cat))) {
      return res.status(400).json({ message: 'Invalid categories' });
    }
  }

  next();
};
