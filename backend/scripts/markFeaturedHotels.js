const mongoose = require('mongoose');
const Hotel = require('../Models/Hotel');
require('dotenv').config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function markHotelsAsFeatured() {
  try {
    // Find the first 5 hotels and mark them as featured
    const hotels = await Hotel.find().limit(5);
    
    if (hotels.length === 0) {
      console.log('No hotels found in the database');
      process.exit(0);
    }

    console.log(`Found ${hotels.length} hotels to mark as featured`);
    
    for (const hotel of hotels) {
      console.log(`Marking '${hotel.name}' as featured`);
      hotel.featured = true;
      await hotel.save();
    }

    console.log('Successfully marked hotels as featured');
    process.exit(0);
  } catch (error) {
    console.error('Error marking hotels as featured:', error);
    process.exit(1);
  }
}

markHotelsAsFeatured();


// (Likely) does a similar operation for hotels, marking some as featured.  
//
// Usage: node markFeaturedHotels.js
//
// Make sure to set the MONGO_URI environment variable to your MongoDB connection string
// before running this script. You can do this by creating a .env file in the same directory