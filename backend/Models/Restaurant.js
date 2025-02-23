const mongoose = require('mongoose');

const SAUDI_CITIES = [
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
];

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required']
  },
  description: {
    type: String
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine type is required']
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    required: [true, 'Price range is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  locationCity: {
    type: String,
    enum: SAUDI_CITIES,
    required: [true, 'City is required']
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          // Allow empty email since it's optional
          return !v || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v.trim());
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          // Allow empty website since it's optional
          return !v || /^https?:\/\/([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v.trim());
        },
        message: props => `${props.value} is not a valid URL!`
      }
    }
  },
  categories: [{
    type: String
  }],
  pictureUrls: [{
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v.trim());
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  },
  openingHours: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
restaurantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = {
  Restaurant,
  SAUDI_CITIES
};
