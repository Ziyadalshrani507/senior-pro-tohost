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

// Get all activities
exports.getActivities = async (req, res) => {
  try {
    const activities = await Destination.find();
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
