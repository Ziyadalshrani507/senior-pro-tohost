const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tourSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  length: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema);