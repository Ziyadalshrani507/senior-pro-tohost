const Destination = require('../Models/Destination');

// Search destinations by name
exports.searchDestinations = async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: 'Name parameter is required for search'
      });
    }
    
    // Use a case-insensitive regex search to find destinations by name
    const destinations = await Destination.find({
      name: { $regex: name, $options: 'i' },
      isActivity: { $ne: true } // Exclude activities
    }).limit(10);
    
    console.log(`Search results for destination name "${name}": ${destinations.length} results found`);
    
    return res.status(200).json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error('Error searching destinations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching destinations',
      error: error.message
    });
  }
};

// Get schema options (enums)
exports.getSchemaOptions = async (req, res) => {
  try {
    const schema = Destination.schema;
    const options = {
      cities: schema.path('locationCity').enumValues,
      types: schema.path('type').enumValues,
      categories: schema.path('categories.0').enumValues
    };
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schema options', error: error.message });
  }
};

// Get all destinations
exports.getDestinations = async (req, res) => {
  try {
    const { lat, lng, radius, limit, featured, country } = req.query;
    let query = {};

    // If coordinates and radius are provided, find destinations within the radius
    if (lat && lng && radius) {
      query = {
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
          }
        }
      };
    }

    // Add featured filter if requested
    if (featured === "true") {
      query.featured = true;
    }

    // Add country filter if provided
    if (country) {
      query.country = country;
    }

    // Create the database query
    let destinationQuery = Destination.find(query);
    
    // Apply limit if provided
    if (limit) {
      destinationQuery = destinationQuery.limit(parseInt(limit));
    }

    const destinations = await destinationQuery;
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching destinations", error: error.message });
  }
};

// Get destinations within radius
exports.getNearbyDestinations = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius in kilometers, default 5km

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const destinations = await Destination.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    });

    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nearby destinations', error: error.message });
  }
};

// Get single destination
exports.getDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destination', error: error.message });
  }
};

// Create destination
exports.createDestination = async (req, res) => {
  try {
    console.log('Creating destination with data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields first
    const requiredFields = ['name', 'description', 'locationCity', 'type', 'cost'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        details: `The following fields are required: ${missingFields.join(', ')}`,
        validationErrors: missingFields
      });
    }
    
    const destination = await Destination.create(req.body);
    console.log('Destination created successfully:', destination._id);
    res.status(201).json(destination);
  } catch (error) {
    console.error('Error creating destination:', error);
    
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
      message: 'Error creating destination', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update destination
exports.updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Error updating destination', error: error.message });
  }
};

// Delete destination
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting destination', error: error.message });
  }
};

// Get all activities
exports.getActivities = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActivity: true };

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      query.$or = [
        { name: searchRegex },
        { locationCity: searchRegex },
        { description: searchRegex }
      ];
    }

    const activities = await Destination.find(query);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Error fetching activities', error: error.message });
  }
};

// Get single activity
exports.getActivity = async (req, res) => {
  try {
    const activity = await Destination.findOne({ 
      _id: req.params.id,
      isActivity: true 
    });
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity', error: error.message });
  }
};

// Create activity
exports.createActivity = async (req, res) => {
  try {
    const activityData = {
      ...req.body,
      isActivity: true
    };

    const activity = await Destination.create(activityData);
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error creating activity', error: error.message });
  }
};

// Update activity
exports.updateActivity = async (req, res) => {
  try {
    const activity = await Destination.findOneAndUpdate(
      { _id: req.params.id, isActivity: true },
      req.body,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error updating activity', error: error.message });
  }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Destination.findOneAndDelete({
      _id: req.params.id,
      isActivity: true
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting activity', error: error.message });
  }
};
