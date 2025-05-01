const mongoose = require('mongoose');
const Destination = require('../Models/Destination');
require('dotenv').config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function markDestinationsAsFeatured() {
  try {
    // Find the first 5 destinations and mark them as featured
    const destinations = await Destination.find().limit(5);
    
    if (destinations.length === 0) {
      console.log('No destinations found in the database');
      process.exit(0);
    }

    console.log(`Found ${destinations.length} destinations to mark as featured`);
    
    for (const destination of destinations) {
      console.log(`Marking '${destination.name}' as featured`);
      destination.featured = true;
      await destination.save();
    }

    console.log('Successfully marked destinations as featured');
    process.exit(0);
  } catch (error) {
    console.error('Error marking destinations as featured:', error);
    process.exit(1);
  }
}

markDestinationsAsFeatured();
