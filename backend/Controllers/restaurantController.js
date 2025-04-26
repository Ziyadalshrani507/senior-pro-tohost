const { Restaurant, SAUDI_CITIES, CUISINES, CATEGORIES } = require('../Models/Restaurant');

// Get all restaurants
exports.getRestaurants = async (req, res) => {
    try {
        const userId = req.user?._id;

        // Get user's likes first if authenticated
        let userLikes = [];
        if (userId) {
            const user = await Restaurant.find({ likes: userId }, '_id').lean();
            userLikes = user.map(r => r._id.toString());
        }

        // Get all restaurants
        const restaurants = await Restaurant.find()
            .select('-__v')
            .sort({ createdAt: -1 })
            .lean();

        // Add isLiked field based on user's likes
        const restaurantsWithLikes = restaurants.map(restaurant => ({
            ...restaurant,
            isLiked: userLikes.includes(restaurant._id.toString()),
            likes: undefined // Don't send the full likes array to client
        }));

        res.json({ restaurants: restaurantsWithLikes });
    } catch (error) {
        console.error('Error in getRestaurants:', error);
        res.status(500).json({
            message: 'Unable to fetch restaurants at this time',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get schema options
exports.getSchemaOptions = async (req, res) => {
    try {
        const schemaOptions = {
            cities: SAUDI_CITIES,
            cuisines: CUISINES,
            categories: CATEGORIES,
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
        if (!SAUDI_CITIES || !Array.isArray(SAUDI_CITIES)) {
            throw new Error('SAUDI_CITIES is not properly initialized');
        }
        res.json({ cities: SAUDI_CITIES });
    } catch (error) {
        console.error('Error in getCities:', error);
        res.status(500).json({
            message: 'Unable to fetch cities at this time',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
            openingHours,
            coordinates
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
        // Get all image URLs from the request (may come from either field in frontend)
        const rawImageUrls = [
            ...(Array.isArray(pictureUrls) ? pictureUrls : []),
            ...(Array.isArray(req.body.images) ? req.body.images : [])
        ];
        
        // Clean up URLs: remove duplicates, empty strings, and whitespace
        const processedImages = [...new Set(
            rawImageUrls
                .filter(url => url && typeof url === 'string' && url.trim())
                .map(url => url.trim())
        )];

        console.log('Processed images:', processedImages); // Debug log

        // Prepare contact object properly
        const contactObj = {
            phone: contact.phone // Phone is required
        };
        
        // Only add email if it's not empty
        if (contact.email && contact.email.trim()) {
            contactObj.email = contact.email.trim();
        }
        
        // Only add website if it's not empty
        if (contact.website && contact.website.trim()) {
            contactObj.website = contact.website.trim();
        }

        // Create new restaurant
        const restaurant = await Restaurant.create({
            name,
            description: description || '',
            cuisine,
            priceRange,
            address,
            locationCity,
            contact: contactObj,
            categories: categories || [],
            images: processedImages,
            // Include coordinates if they're provided
            ...(coordinates && { coordinates }),
            // Set up rating properly based on incoming format
            rating: {
                average: typeof rating === 'object' ? (rating.average || 0) : (rating || 0),
                count: typeof rating === 'object' ? (rating.count || 0) : 0
            },
            openingHours: openingHours || ''
        });

        console.log('Created new restaurant:', restaurant); // Debug log
        res.status(201).json(restaurant);
    } catch (error) {
        console.error('Error creating restaurant:', error);
        console.error('Request body:', req.body); // Log the request body
        
        if (error.name === 'ValidationError') {
            // Enhanced validation error logging
            console.error('Validation Error Details:', JSON.stringify(error.errors, null, 2));
            
            return res.status(400).json({ 
                message: 'Validation Error', 
                error: error.message,
                details: Object.values(error.errors).map(err => err.message),
                validationErrors: error.errors // Send the full validation errors object
            });
        }
        res.status(500).json({ 
            message: 'Error creating restaurant', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
            openingHours,
            coordinates
        } = req.body;

        console.log('Updating restaurant with data:', req.body); // Debug log

        // Process picture URLs
        // Get all image URLs from the request (may come from either field in frontend)
        const rawImageUrls = [
            ...(Array.isArray(pictureUrls) ? pictureUrls : []),
            ...(Array.isArray(req.body.images) ? req.body.images : [])
        ];
        
        // Clean up URLs: remove duplicates, empty strings, and whitespace
        const processedImages = [...new Set(
            rawImageUrls
                .filter(url => url && typeof url === 'string' && url.trim())
                .map(url => url.trim())
        )];

        console.log('Processed images:', processedImages); // Debug log

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
                images: processedImages, // Store in both fields for consistency
                // Include coordinates if they're provided
                ...(coordinates && { coordinates }),
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
