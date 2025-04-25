const Tour = require('../Models/Tour');

// Get all tours
exports.getTours = async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.json(tours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ message: 'Unable to fetch tours at this time' });
  }
};

// Create a new tour
exports.createTour = async (req, res) => {
  try {
    const { title, description, level, duration, length, image } = req.body;

    const newTour = await Tour.create({
      title,
      description,
      level,
      duration,
      length,
      image
    });

    res.status(201).json(newTour);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ message: 'Error creating tour' });
  }
};

// Update a tour
exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTour = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedTour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    res.json(updatedTour);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ message: 'Error updating tour' });
  }
};

// Delete a tour
exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTour = await Tour.findByIdAndDelete(id);

    if (!deletedTour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ message: 'Error deleting tour' });
  }
};