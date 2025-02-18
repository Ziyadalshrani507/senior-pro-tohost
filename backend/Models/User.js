const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema(
  {
    // First name: required, trimmed, and with length constraints.
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [1, 'First name must have at least 1 character'],
      maxlength: [50, 'First name must not exceed 50 characters']
    },
    // Last name: required, trimmed, and with length constraints.
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name must have at least 1 character'],
      maxlength: [50, 'Last name must not exceed 50 characters']
    },
    // Email: required, unique, lowercased, trimmed, and must match email format.
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    // Password: required and with a minimum length constraint.
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must have at least 6 characters']
    },
    // Gender: required and with allowed values.
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female']
    },
    // Preferences: defaults to an empty array.
    preferences: {
      type: [String],
      default: []
    },
    // Role: allowed values are 'user' and 'admin' with a default of 'user'.
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either "user" or "admin"'
      },
      default: 'user'
    },
    // Profile picture: stored as a string; defaults to null if not provided.
    profilePicture: {
      type: String,
      default: null
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
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
