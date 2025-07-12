const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'points'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  offeredItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: function() {
      return this.type === 'direct';
    }
  },
  pointsAmount: {
    type: Number,
    min: [0, 'Points amount cannot be negative'],
    required: function() {
      return this.type === 'points';
    }
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    default: ''
  },
  initiatorRating: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [200, 'Comment cannot exceed 200 characters']
    },
    createdAt: {
      type: Date
    }
  },
  recipientRating: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [200, 'Comment cannot exceed 200 characters']
    },
    createdAt: {
      type: Date
    }
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
swapSchema.index({ initiator: 1 });
swapSchema.index({ recipient: 1 });
swapSchema.index({ status: 1 });
swapSchema.index({ type: 1 });
swapSchema.index({ requestedItem: 1 });
swapSchema.index({ createdAt: -1 });

// Virtual for swap duration
swapSchema.virtual('duration').get(function() {
  if (this.completedAt) {
    return this.completedAt - this.createdAt;
  }
  return Date.now() - this.createdAt;
});

// Virtual for is active
swapSchema.virtual('isActive').get(function() {
  return ['pending', 'accepted'].includes(this.status);
});

// Method to accept swap
swapSchema.methods.accept = function() {
  if (this.status !== 'pending') {
    throw new Error('Swap can only be accepted when pending');
  }
  this.status = 'accepted';
  return this.save();
};

// Method to reject swap
swapSchema.methods.reject = function() {
  if (this.status !== 'pending') {
    throw new Error('Swap can only be rejected when pending');
  }
  this.status = 'rejected';
  return this.save();
};

// Method to complete swap
swapSchema.methods.complete = function() {
  if (this.status !== 'accepted') {
    throw new Error('Swap can only be completed when accepted');
  }
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to cancel swap
swapSchema.methods.cancel = function(userId, reason = '') {
  if (!['pending', 'accepted'].includes(this.status)) {
    throw new Error('Swap can only be cancelled when pending or accepted');
  }
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
  this.cancellationReason = reason;
  return this.save();
};

// Method to add rating
swapSchema.methods.addRating = function(userId, rating, comment) {
  if (this.status !== 'completed') {
    throw new Error('Can only rate completed swaps');
  }
  
  if (this.initiator.toString() === userId.toString()) {
    this.initiatorRating = { rating, comment, createdAt: new Date() };
  } else if (this.recipient.toString() === userId.toString()) {
    this.recipientRating = { rating, comment, createdAt: new Date() };
  } else {
    throw new Error('User not authorized to rate this swap');
  }
  
  return this.save();
};

// Static method to get user's swaps
swapSchema.statics.getUserSwaps = function(userId, status = null) {
  const query = {
    $or: [{ initiator: userId }, { recipient: userId }]
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('initiator', 'username firstName lastName avatar')
    .populate('recipient', 'username firstName lastName avatar')
    .populate('requestedItem', 'title images status')
    .populate('offeredItem', 'title images status')
    .sort({ createdAt: -1 });
};

// Static method to get pending swaps for user
swapSchema.statics.getPendingSwaps = function(userId) {
  return this.find({
    recipient: userId,
    status: 'pending'
  })
  .populate('initiator', 'username firstName lastName avatar')
  .populate('requestedItem', 'title images status')
  .populate('offeredItem', 'title images status')
  .sort({ createdAt: -1 });
};

// Static method to get swap statistics
swapSchema.statics.getSwapStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [{ initiator: mongoose.Types.ObjectId(userId) }, { recipient: mongoose.Types.ObjectId(userId) }]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Swap', swapSchema); 