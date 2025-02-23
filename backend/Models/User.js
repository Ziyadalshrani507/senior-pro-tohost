const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema(
  {
    // First name: required, trimmed, and with length constraints.
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'First name must have at least 3 characters'],
      maxlength: [50, 'First name must not exceed 50 characters']
    },
    // Last name: required, trimmed, and with length constraints.
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Last name must have at least 3 characters'],
      maxlength: [50, 'Last name must not exceed 50 characters']
    },
    // Email: required, unique, lowercased, trimmed, and must match email format.
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    // Password: required, with minimum length.
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    // Gender: optional.
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: ''
    },
    // Preferences: defaults to an empty array.
    preferences: {
      type: [String],
      default: []
    },
    // Role: defaults to 'user'.
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    // Profile picture stored as Base64
    profilePicture: {
      data: String, // Base64 encoded image data
      contentType: String // MIME type of the image
    },
    phone: {
      type: String
    }
  },
  {
    // Automatically manage createdAt and updatedAt timestamps.
    timestamps: true
  }
);

// Pre-save hook to hash the password if it has been modified or is new.
userSchema.pre('save', async function (next) {
  // 'this' refers to the current user document.
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt with the defined work factor.
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    // Hash the password using the generated salt.
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);
