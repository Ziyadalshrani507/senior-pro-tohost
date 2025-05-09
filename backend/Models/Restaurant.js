const mongoose = require('mongoose');

const CUISINES = [
  'Italian',
  'Japanese',
  'Greek',
  'Chinese',
  'Indonesian',
  'Mexican',
  'Turkish',
  'Spanish',
  'French',
  'Indian',
  'American',
  'Algerian',
  'Korean',
  'Lebanese',
  'Filipino',
  'Moroccan',
  'Egyptian',
  'Iranian',
  'Syrian',
  'khaleeji'
];

const CATEGORIES = [
  'Fine Dining',
  'Casual Dining',
  'Fast Food',
  'Cafe',
  'Buffet',
  'Food Truck',
  'Family Style',
  'Steakhouse',
  'Seafood',
  'Vegetarian',
  'Dessert',
  'Bakery',
  'Barbecue'
];

const SAUDI_CITIES = [
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
    enum: CUISINES,
    required: [true, 'Cuisine type is required']
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    required: [true, 'Price range is required']
  },
  locationCity: {
    type: String,
    enum: SAUDI_CITIES,
    required: [true, 'City is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: props => `${props.value} is not a valid coordinate pair!`
      }
    }
  },
  contact: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      validate: {
        validator(v) {
          return !v || /^\S+@\S+\.\S+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator(v) {
          return !v || /^https?:\/\/\S+$/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    }
  },
  openingHours: {
    open: {
      hour: {
        type: Number,
        required: true,
        min: 1,
        max: 12
      },
      minute: {
        type: Number,
        required: true,
        min: 0,
        max: 59
      },
      period: {
        type: String,
        enum: ['AM', 'PM'],
        required: true
      }
    },
    close: {
      hour: {
        type: Number,
        required: true,
        min: 1,
        max: 12
      },
      minute: {
        type: Number,
        required: true,
        min: 0,
        max: 59
      },
      period: {
        type: String,
        enum: ['AM', 'PM'],
        required: true
      }
    }
  },
  categories: [{
    type: String,
    enum: CATEGORIES
  }],
  images: {
    type: [String],
    default: []
  },
  rating: {
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
  likes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Likes must be an array'
    }
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Create indexes for geospatial queries and likes
restaurantSchema.index({ coordinates: '2dsphere' });
restaurantSchema.index({ likes: 1 }); // Index for faster likes lookup
// Create a compound index on name and locationCity to ensure unique names per city
restaurantSchema.index({ name: 1, locationCity: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
restaurantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = {
    Restaurant,
    SAUDI_CITIES,
    CUISINES,
    CATEGORIES
};


//Defines the schema for restaurants (e.g., name, location, cuisine).
// : The schema includes fields for name, description, cuisine, price range, location, contact information, opening hours, categories, images, and ratings.
// : The schema also includes fields for likes and like count, with validation for coordinates and timestamps.
// : The schema uses a 2dsphere index for geospatial queries and a compound index to ensure unique names per city.
// : The schema also includes pre-save middleware to update the updatedAt timestamp.