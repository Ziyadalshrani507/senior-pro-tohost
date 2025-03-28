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
      "Buraydah",
      "Khamis Mushait",
      "Abha",
      "Al Khobar",
      "Najran",
      "Hail",
      "Al Jubail",
      "Hofuf",
      "Yanbu",
      "Arar",
      "Sakakah",
      "Al Qatif",
      "Al Bahah",
      "Jazan",
      "Unaizah",
      "Zulfi",
      "Dhahran",
      "Al Majma'ah",
      "Rafha",
      "Al Kharj",
      "Bisha",
      "Al-Ula",
      "Ar Rass"
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
      required: true,
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
    type: Number,
    min: 0,
    max: 5,
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
  }
}, { timestamps: true });

// Create a 2dsphere index on coordinates
destinationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Destination', destinationSchema);
