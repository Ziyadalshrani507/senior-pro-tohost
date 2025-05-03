const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  itemType: {
    type: String,
    enum: ['destination', 'restaurant', 'hotel'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxLength: 1000,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'flagged', 'rejected'],
    default: 'pending'
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  moderationNotes: {
    type: String
  },
  visitDate: {
    type: Date
  }
}, { timestamps: true });

// Add compound index for efficient querying
ratingSchema.index({ itemId: 1, itemType: 1, createdAt: -1 });

// Add text index for search and moderation
ratingSchema.index({ comment: 'text' });

// Method to check for duplicate content
ratingSchema.methods.isDuplicate = async function() {
  const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
  const duplicates = await this.constructor.find({
    userId: this.userId,
    itemId: this.itemId,
    itemType: this.itemType,
    createdAt: { $gte: timeWindow },
    comment: this.comment
  });
  return duplicates.length > 0;
};

module.exports = mongoose.model('Rating', ratingSchema);
