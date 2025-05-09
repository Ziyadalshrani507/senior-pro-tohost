const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const destinationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  locationCity: {
    type: String,
    required: true,
    enum: [
      "Riyadh",
  "Jeddah",
  "Mecca",
  "Medina",
  "Dammam",
  "Taif",
  "Tabuk",
  "Asir",
  "Abha",
  "Al Khobar",
  "Hail",
  "Al Jubail",
  "Al-Ahsa",
  "Yanbu",
  "Al Bahah",
  "Jazan",
  "Al Qassim",
  "Dhahran",
  "Al-Ula",
    ]
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false, // Make coordinates optional
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  },
  type: {
    type: String,
    enum: [
      "Historical",
      "Adventure",
      "Cultural",
      "Experiences",
      "Theater and arts",
      "Concerts",
      "Sports",
      "Food",
      "Music"
    ],
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  rating: {
    // Updated to match the Restaurant model rating structure
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  categories: [{
    type: String,
    enum: [
      "Family-friendly",
      "Outdoor",
      "Luxury",
      "Budget",
      "Solo-traveler",
      "Group-traveler",
      "Indoor"
    ],
  }],
  pictureUrls: [{
    type: String,
  }],
  isActivity: {
    type: Boolean,
    default: false,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  country: {
    type: String,
    default: "Saudi Arabia"
  }
}, { timestamps: true });

// Create a 2dsphere index on coordinates
destinationSchema.index({ coordinates: '2dsphere' });

// Create a compound index on name and locationCity to ensure unique names per city
destinationSchema.index({ name: 1, locationCity: 1 }, { unique: true });

module.exports = mongoose.model('Destination', destinationSchema);


// : Defines the schema for travel destinations (e.g., name, location, description).
// : This schema is used to create a MongoDB model for storing and managing destination data.
//
// : The schema includes fields for name, description, location (with coordinates), type, cost, rating, categories, and more.
// : It also includes validation for coordinates to ensure they are in the correct format and range.
// : The schema uses a 2dsphere index for geospatial queries and a compound index to ensure unique names per city.
// : The model is exported for use in other parts of the application, allowing for CRUD operations on destination data.
// : The schema is designed to be flexible and extensible, making it easy to add new fields or modify existing ones as needed.
// : The code uses Mongoose, a popular ODM (Object Data Modeling) library for MongoDB and Node.js, to define the schema and model.