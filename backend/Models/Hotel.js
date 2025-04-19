const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
  },
  description: {
    type: String,
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
      ]},,
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
      required: true,
      validate: {
        validator: function (v) {
          return (
            v.length === 2 &&
            v[0] >= -180 &&
            v[0] <= 180 && // longitude
            v[1] >= -90 &&
            v[1] <= 90 // latitude
          );
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges',
      },
    },
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  pictureUrls: {
    type: [String],
    default: [],
  },
  availableDates: {
    type: [Date],
    required: true,
  },
});

const Hotel = mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;