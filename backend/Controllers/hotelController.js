const Hotel = require('../Models/Hotel');

// Get schema options (enums)
exports.getSchemaOptions = async (req, res) => {
  try {
    const schema = Hotel.schema;

    // Dynamically fetch enum values from the schema
    const options = {
      cities: schema.path('locationCity').enumValues || [],
      hotelClasses: schema.path('hotelClass').enumValues || [],
      priceRanges: schema.path('priceRange').enumValues || [],
      amenities: [
        'Wi-Fi', 'Swimming Pool', 'Fitness Center', 'Spa', 'Restaurant',
        'Room Service', 'Airport Shuttle', 'Parking', 'Air Conditioning',
        'Laundry Service', 'Business Center', 'Pet Friendly', 'Concierge',
        'Bar/Lounge', 'Beach Access', 'Breakfast Included', 'Conference Rooms',
        'Disabled Access', 'Free Toiletries', 'Hair Dryer', 'In-room Safe',
        'Kids Club', 'Mini Bar', 'Non-smoking Rooms', 'Refrigerator',
        'Room Service', 'Sauna', 'TV', 'Valet Parking', 'Wake-up Service'
      ]
    };

    res.json(options);
  } catch (error) {
    console.error('Error fetching schema options:', error);
    res.status(500).json({ message: 'Error fetching schema options', error: error.message });
  }
};

// Get all hotels
exports.getHotels = async (req, res) => {
  try {
    const { city, priceRange, rating, amenities, hotelClass } = req.query;
    
    // Build query based on filters
    const query = { isDeleted: { $ne: true } };
    
    if (city) query.locationCity = city;
    if (priceRange) query.priceRange = priceRange;
    if (rating) query['rating.average'] = { $gte: parseFloat(rating) };
    if (hotelClass) query.hotelClass = hotelClass;
    if (amenities) query.amenities = { $in: [amenities] };
    
    const hotels = await Hotel.find(query);
    res.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ message: 'Error fetching hotels' });
  }
};

// Get a single hotel by ID
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ message: 'Error fetching hotel' });
  }
};

// Create a new hotel
exports.createHotel = async (req, res) => {
  try {
    // Log the request body to debug what's being sent
    console.log('Hotel create request body:', JSON.stringify(req.body, null, 2));
    
    // Ensure the user is authenticated and has admin role (assuming middleware handles this)
    const hotelData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Before creating, check for common validation issues
    if (!hotelData.contact || typeof hotelData.contact !== 'object') {
      console.log('Contact information missing');
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: ['Contact information is required']
      });
    }
    
    const hotel = await Hotel.create(hotelData);
    res.status(201).json(hotel);
  } catch (error) {
    console.error('Error creating hotel:', error);
    
    if (error.name === 'ValidationError') {
      console.log('Validation error details:', error);
      // Create a more detailed error response
      const validationErrors = {};
      
      // Extract field-specific errors
      if (error.errors) {
        Object.keys(error.errors).forEach(field => {
          validationErrors[field] = error.errors[field].message;
        });
      }
      
      return res.status(400).json({ 
        message: 'Validation error', 
        validationErrors,
        errors: Object.values(error.errors || {}).map(e => e.message || String(e))
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating hotel', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update a hotel
exports.updateHotel = async (req, res) => {
  try {
    const hotelData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, hotelData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are applied
    });
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    res.json(hotel);
  } catch (error) {
    console.error('Error updating hotel:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Error updating hotel', error: error.message });
  }
};

// Delete a hotel
exports.deleteHotel = async (req, res) => {
  try {
    // Soft delete instead of hard delete
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, 
      { isDeleted: true, updatedAt: new Date() },
      { new: true }
    );
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ message: 'Error deleting hotel', error: error.message });
  }
};

// Hard delete a hotel (admin only)
exports.hardDeleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    res.json({ message: 'Hotel permanently deleted' });
  } catch (error) {
    console.error('Error permanently deleting hotel:', error);
    res.status(500).json({ message: 'Error permanently deleting hotel', error: error.message });
  }
};