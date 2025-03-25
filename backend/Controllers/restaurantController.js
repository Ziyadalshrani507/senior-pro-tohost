const { Restaurant, SAUDI_CITIES } = require('../Models/Restaurant');

// Get all restaurants
exports.getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        console.log('Fetched all restaurants:', restaurants); // Debug log
        res.json(restaurants);
    } catch (error) {
        console.error('Error in getRestaurants:', error);
        res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
    }
};

// Get schema options
exports.getSchemaOptions = async (req, res) => {
    try {
        const schemaOptions = {
            cities: SAUDI_CITIES,
            cuisines: [
                'Saudi',
                'Lebanese',
                'Indian',
                'Italian',
                'Chinese',
                'Japanese',
                'Thai',
                'Mexican',
                'Mediterranean',
                'American',
                'Turkish',
                'French'
            ],
            categories: [
                'Fine Dining',
                'Casual Dining',
                'Fast Food',
                'Cafe',
                'Buffet',
                'Food Truck',
                'Family Style',
                'Steakhouse',
                'Seafood',
                'Vegetarian',
                'Halal'
            ],
            priceRanges: ['$', '$$', '$$$', '$$$$']
        };
        console.log('Fetched schema options:', schemaOptions); // Debug log
        res.json(schemaOptions);
    } catch (error) {
        console.error('Error in getSchemaOptions:', error);
        res.status(500).json({ message: 'Error fetching schema options', error: error.message });
    }
};

// Get available cities
exports.getCities = async (req, res) => {
    try {
        console.log('Fetching available cities:', SAUDI_CITIES); // Debug log
        res.json({ cities: SAUDI_CITIES });
    } catch (error) {
        console.error('Error in getCities:', error);
        res.status(500).json({ message: 'Error fetching cities', error: error.message });
    }
};

// Create a new restaurant
exports.createRestaurant = async (req, res) => {
    try {
        const {
            name,
            description,
            cuisine,
            priceRange,
            address,
            locationCity,
            contact,
            categories,
            pictureUrls,
            rating,
            openingHours
        } = req.body;

        console.log('Creating new restaurant with data:', req.body); // Debug log

        // Validate required fields based on schema
        if (!name || !locationCity || !cuisine || !priceRange || !address || !contact?.phone) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                missingFields: {
                    name: !name,
                    locationCity: !locationCity,
                    cuisine: !cuisine,
                    priceRange: !priceRange,
                    address: !address,
                    phone: !contact?.phone
                }
            });
        }

        // Process picture URLs
        const processedPictureUrls = pictureUrls?.filter(url => url && typeof url === 'string' && url.trim())
            .map(url => url.trim()) || [];

        console.log('Processed picture URLs:', processedPictureUrls); // Debug log

        // Create new restaurant
        const restaurant = await Restaurant.create({
            name,
            description: description || '',
            cuisine,
            priceRange,
            address,
            locationCity,
            contact: {
                phone: contact.phone,
                email: (contact.email || '').trim(),
                website: (contact.website || '').trim()
            },
            categories: categories || [],
            pictureUrls: processedPictureUrls,
            rating: rating || 0,
            openingHours: openingHours || '',
            reviews: 0
        });

        console.log('Created new restaurant:', restaurant); // Debug log
        res.status(201).json(restaurant);
    } catch (error) {
        console.error('Error creating restaurant:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                error: error.message,
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error creating restaurant', error: error.message });
    }
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
    try {
        console.log('Fetching restaurant with ID:', req.params.id); // Debug log
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Fetch related restaurants (example logic, adjust as needed)
        const relatedRestaurants = await Restaurant.find({
            cuisine: restaurant.cuisine,
            _id: { $ne: restaurant._id }
        }).limit(5);

        console.log('Found restaurant:', restaurant); // Debug log
        res.json({ ...restaurant.toObject(), relatedRestaurants });
    } catch (error) {
        console.error('Error in getRestaurantById:', error);
        res.status(500).json({ message: 'Error fetching restaurant', error: error.message });
    }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
    try {
        const {
            name,
            description,
            cuisine,
            priceRange,
            address,
            locationCity,
            contact,
            categories,
            pictureUrls,
            rating,
            openingHours
        } = req.body;

        console.log('Updating restaurant with data:', req.body); // Debug log

        // Process picture URLs
        const processedPictureUrls = pictureUrls?.filter(url => url && typeof url === 'string' && url.trim())
            .map(url => url.trim()) || [];

        console.log('Processed picture URLs:', processedPictureUrls); // Debug log

        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description: description || '',
                cuisine,
                priceRange,
                address,
                locationCity,
                contact: {
                    phone: contact.phone,
                    email: (contact.email || '').trim(),
                    website: (contact.website || '').trim()
                },
                categories: categories || [],
                pictureUrls: processedPictureUrls,
                rating: rating || 0,
                openingHours: openingHours || ''
            },
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        console.log('Updated restaurant:', restaurant); // Debug log
        res.json(restaurant);
    } catch (error) {
        console.error('Error updating restaurant:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                error: error.message,
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error updating restaurant', error: error.message });
    }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
    try {
        console.log('Deleting restaurant with ID:', req.params.id); // Debug log
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        console.log('Deleted restaurant:', restaurant); // Debug log
        res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).json({ message: 'Error deleting restaurant', error: error.message });
    }
};
