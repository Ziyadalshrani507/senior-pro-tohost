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

module.exports = mongoose.model('Destination', destinationSchema);
