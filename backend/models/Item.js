const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 
      'accessories', 'jewelry', 'bags', 'hats', 'scarves'
    ]
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: [
      'casual', 'formal', 'business', 'sportswear', 'vintage',
      'streetwear', 'bohemian', 'minimalist', 'luxury', 'eco-friendly'
    ]
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    enum: [
      'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
      '2', '4', '6', '8', '10', '12', '14', '16', '18', '20',
      '22', '24', '26', '28', '30', '32', '34', '36', '38', '40',
      '42', '44', '46', '48', '50', '52', '54', '56', '58', '60',
      '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5',
      '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14',
      'one-size', 'custom'
    ]
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['new', 'like-new', 'excellent', 'good', 'fair', 'poor']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  material: {
    type: String,
    trim: true,
    maxlength: [100, 'Material cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'available', 'reserved', 'swapped', 'removed'],
    default: 'pending'
  },
  swapType: {
    type: String,
    enum: ['direct', 'points', 'both'],
    default: 'both'
  },
  pointsValue: {
    type: Number,
    min: [0, 'Points value cannot be negative'],
    default: 0
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  rejectionReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
itemSchema.index({ owner: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ type: 1 });
itemSchema.index({ size: 1 });
itemSchema.index({ condition: 1 });
itemSchema.index({ isFeatured: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for primary image
itemSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for like count
itemSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Method to increment views
itemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
itemSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Method to check if user liked the item
itemSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

// Method to get public item data (without sensitive info)
itemSchema.methods.getPublicData = function() {
  const itemObject = this.toObject();
  delete itemObject.adminNotes;
  delete itemObject.rejectionReason;
  return itemObject;
};

// Static method to get featured items
itemSchema.statics.getFeaturedItems = function(limit = 10) {
  return this.find({ 
    status: 'available', 
    isFeatured: true 
  })
  .populate('owner', 'username firstName lastName avatar')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to search items
itemSchema.statics.searchItems = function(query, filters = {}) {
  const searchQuery = {
    status: 'available',
    ...filters
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .populate('owner', 'username firstName lastName avatar')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 });
};

module.exports = mongoose.model('Item', itemSchema); 