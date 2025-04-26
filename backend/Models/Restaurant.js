const mongoose = require('mongoose');

const CUISINES = [
  'Italian',
  'Japanese',
  'Greek',
  'Portuguese',
  'Chinese',
  'Indonesian',
  'Mexican',
  'Turkish',
  'Spanish',
  'French',
  'Polish',
  'Indian',
  'American',
  'Peruvian',
  'Serbian',
  'Brazilian',
  'Croatian',
  'Colombian',
  'Vietnamese',
  'Hungarian',
  'Algerian',
  'Korean',
  'German',
  'Romanian',
  'Argentinian',
  'Lebanese',
  'Czech',
  'Thai',
  'Georgian',
  'Austrian',
  'Chilean',
  'Bulgarian',
  'Russian',
  'South African',
  'Filipino',
  'Malaysian',
  'Moroccan',
  'Lithuanian',
  'Egyptian',
  'Iranian',
  'Syrian',
  'Canadian',
  'Ukrainian',
  'Dutch',
  'Palestinian',
  'Macedonian',
  'English',
  'Ethiopian',
  'Cypriot',
  'Saudi Arabian',
  'Middle Eastern'
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
  'Halal',
  'Dessert',
  'Bakery',
  'Street Food',
  'Barbecue',
  'Vegan',
  'Pub',
  'Brunch',
  'Tapas',
  'Sushi Bar',
  'Wine Bar',
  'Rooftop',
  'Farm to Table',
  'Organic',
  'Gluten Free',
  'Kosher'
];

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
      required: [true, 'Phone number is required']
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    }
  },
  categories: [{
    type: String,
    enum: CATEGORIES
  }],
  images: {
    type: [String],
    validate: {
      validator: function(urls) {
        return urls.every(url => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url));
      },
      message: props => `One or more image URLs are invalid!`
    },
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
