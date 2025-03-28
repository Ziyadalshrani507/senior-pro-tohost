const Destination = require('../Models/Destination');

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
    const { lat, lng, radius } = req.query;
    let query = {};

    // If coordinates and radius are provided, find destinations within the radius
    if (lat && lng && radius) {
      query = {
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
          }
        }
      };
    }

    const destinations = await Destination.find(query);
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destinations', error: error.message });
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
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Error creating destination', error: error.message });
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
    const activities = await Destination.find({ isActivity: true });
    res.json(activities);
  } catch (error) {
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
