const mongoose = require('mongoose');

// Room type schema for nested room types
const roomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  available: {
    type: Number,
    required: true,
    min: 0
  }
});

// Contact info schema
const contactSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: String,
  website: String
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
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
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function (v) {
          return (
            !v || (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 && // longitude
              v[1] >= -90 &&
              v[1] <= 90 // latitude
            )
          );
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges',
      },
    },
  },
  hotelClass: {
    type: String,
    default: '3',
    enum: ['1', '2', '3', '4', '5'] // Star rating as string for easier frontend handling
  },
  priceRange: {
    type: String,
    default: '$',
    enum: ['$', '$$', '$$$', '$$$$']
  },
  amenities: {
    type: [String],
    default: ['Wi-Fi']
  },
  roomTypes: {
    type: [roomTypeSchema],
    default: []
  },
  checkInTime: {
    type: String,
    default: '14:00'
  },
  checkOutTime: {
    type: String,
    default: '12:00'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  pictureUrls: {
    type: [String],
    default: []
  },
  contact: {
    type: contactSchema,
    default: () => ({
      phone: 'Not provided',
      email: '',
      website: ''
    })
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Hotel = mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;