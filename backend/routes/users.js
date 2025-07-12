const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const { authenticateToken, requireOwnership } = require('../middleware/auth');
const { validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile/:userId
// @desc    Get user public profile
// @access  Public
router.get('/profile/:userId', validateObjectId('userId'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -email -isVerified -isActive -lastLogin -preferences');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.getPublicProfile() });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Failed to get user profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, bio, location, avatar } = req.body;
    const updateData = {};

    if (firstName !== undefined) {
      updateData.firstName = firstName.trim();
    }
    if (lastName !== undefined) {
      updateData.lastName = lastName.trim();
    }
    if (bio !== undefined) {
      updateData.bio = bio.trim();
    }
    if (location !== undefined) {
      updateData.location = location.trim();
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// @route   GET /api/users/items/:userId
// @desc    Get user's items
// @access  Public
router.get('/items/:userId', validateObjectId('userId'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    const items = await Item.find({ 
      owner: req.params.userId,
      status: { $in: ['available', 'reserved'] }
    })
    .populate('owner', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Item.countDocuments({ 
      owner: req.params.userId,
      status: { $in: ['available', 'reserved'] }
    });

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ message: 'Failed to get user items' });
  }
});

// @route   GET /api/users/stats/:userId
// @desc    Get user statistics
// @access  Public
router.get('/stats/:userId', validateObjectId('userId'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get item statistics
    const itemStats = await Item.aggregate([
      { $match: { owner: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get swap statistics
    const swapStats = await Swap.aggregate([
      {
        $match: {
          $or: [{ initiator: user._id }, { recipient: user._id }]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total points earned (from completed swaps)
    const pointsEarned = await Swap.aggregate([
      {
        $match: {
          recipient: user._id,
          status: 'completed',
          type: 'points'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pointsAmount' }
        }
      }
    ]);

    const stats = {
      items: {
        total: 0,
        available: 0,
        reserved: 0,
        swapped: 0
      },
      swaps: {
        total: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        cancelled: 0
      },
      points: {
        current: user.points,
        earned: pointsEarned[0]?.total || 0
      }
    };

    // Process item stats
    itemStats.forEach(stat => {
      if (stat._id === 'available') stats.items.available = stat.count;
      else if (stat._id === 'reserved') stats.items.reserved = stat.count;
      else if (stat._id === 'swapped') stats.items.swapped = stat.count;
      stats.items.total += stat.count;
    });

    // Process swap stats
    swapStats.forEach(stat => {
      if (stat._id === 'pending') stats.swaps.pending = stat.count;
      else if (stat._id === 'accepted') stats.swaps.accepted = stat.count;
      else if (stat._id === 'completed') stats.swaps.completed = stat.count;
      else if (stat._id === 'cancelled') stats.swaps.cancelled = stat.count;
      stats.swaps.total += stat.count;
    });

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to get user statistics' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', validatePagination, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('username firstName lastName avatar bio location points')
      .sort({ username: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

// @route   GET /api/users/me/items
// @desc    Get current user's items
// @access  Private
router.get('/me/items', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { owner: req.user._id };
    if (status) {
      query.status = status;
    }

    const items = await Item.find(query)
      .populate('owner', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments(query);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({ message: 'Failed to get your items' });
  }
});

// @route   GET /api/users/me/swaps
// @desc    Get current user's swaps
// @access  Private
router.get('/me/swaps', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const swaps = await Swap.getUserSwaps(req.user._id, status)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Swap.countDocuments({
      $or: [{ initiator: req.user._id }, { recipient: req.user._id }],
      ...(status && { status })
    });

    res.json({
      swaps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my swaps error:', error);
    res.status(500).json({ message: 'Failed to get your swaps' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { notifications, privacy } = req.body;
    const updateData = {};

    if (notifications) {
      updateData['preferences.notifications'] = notifications;
    }
    if (privacy) {
      updateData['preferences.privacy'] = privacy;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

// @route   DELETE /api/users/me
// @desc    Delete current user account
// @access  Private
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Deactivate account instead of deleting
    user.isActive = false;
    await user.save();

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router; 