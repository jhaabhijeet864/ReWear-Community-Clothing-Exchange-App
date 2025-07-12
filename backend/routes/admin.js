const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      }
    ]);

    // Get item statistics
    const itemStats = await Item.aggregate([
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
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity
    const recentItems = await Item.find()
      .populate('owner', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSwaps = await Swap.find()
      .populate('initiator', 'username firstName lastName')
      .populate('recipient', 'username firstName lastName')
      .populate('requestedItem', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format statistics
    const stats = {
      users: {
        total: userStats[0]?.total || 0,
        active: userStats[0]?.active || 0,
        verified: userStats[0]?.verified || 0
      },
      items: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        available: 0,
        swapped: 0
      },
      swaps: {
        total: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0
      }
    };

    // Process item stats
    itemStats.forEach(stat => {
      if (stat._id === 'pending') stats.items.pending = stat.count;
      else if (stat._id === 'approved') stats.items.approved = stat.count;
      else if (stat._id === 'rejected') stats.items.rejected = stat.count;
      else if (stat._id === 'available') stats.items.available = stat.count;
      else if (stat._id === 'swapped') stats.items.swapped = stat.count;
      stats.items.total += stat.count;
    });

    // Process swap stats
    swapStats.forEach(stat => {
      if (stat._id === 'pending') stats.swaps.pending = stat.count;
      else if (stat._id === 'accepted') stats.swaps.accepted = stat.count;
      else if (stat._id === 'completed') stats.swaps.completed = stat.count;
      else if (stat._id === 'cancelled') stats.swaps.cancelled = stat.count;
      else if (stat._id === 'rejected') stats.swaps.rejected = stat.count;
      stats.swaps.total += stat.count;
    });

    res.json({
      stats,
      recentActivity: {
        items: recentItems,
        swaps: recentSwaps
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to get dashboard statistics' });
  }
});

// @route   GET /api/admin/items
// @desc    Get items for moderation
// @access  Private (Admin only)
router.get('/items', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const items = await Item.find(query)
      .populate('owner', 'username firstName lastName email')
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
    console.error('Get admin items error:', error);
    res.status(500).json({ message: 'Failed to get items for moderation' });
  }
});

// @route   PUT /api/admin/items/:itemId/approve
// @desc    Approve an item
// @access  Private (Admin only)
router.put('/items/:itemId/approve', validateObjectId('itemId'), async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'pending') {
      return res.status(400).json({ message: 'Can only approve pending items' });
    }

    item.status = 'available';
    if (adminNotes) {
      item.adminNotes = adminNotes;
    }

    await item.save();

    await item.populate('owner', 'username firstName lastName email');

    res.json({
      message: 'Item approved successfully',
      item
    });
  } catch (error) {
    console.error('Approve item error:', error);
    res.status(500).json({ message: 'Failed to approve item' });
  }
});

// @route   PUT /api/admin/items/:itemId/reject
// @desc    Reject an item
// @access  Private (Admin only)
router.put('/items/:itemId/reject', validateObjectId('itemId'), async (req, res) => {
  try {
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'pending') {
      return res.status(400).json({ message: 'Can only reject pending items' });
    }

    item.status = 'rejected';
    item.rejectionReason = rejectionReason;
    if (adminNotes) {
      item.adminNotes = adminNotes;
    }

    await item.save();

    await item.populate('owner', 'username firstName lastName email');

    res.json({
      message: 'Item rejected successfully',
      item
    });
  } catch (error) {
    console.error('Reject item error:', error);
    res.status(500).json({ message: 'Failed to reject item' });
  }
});

// @route   PUT /api/admin/items/:itemId/feature
// @desc    Toggle featured status of an item
// @access  Private (Admin only)
router.put('/items/:itemId/feature', validateObjectId('itemId'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ message: 'Can only feature available items' });
    }

    item.isFeatured = !item.isFeatured;
    await item.save();

    await item.populate('owner', 'username firstName lastName email');

    res.json({
      message: `Item ${item.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      item
    });
  } catch (error) {
    console.error('Toggle item feature error:', error);
    res.status(500).json({ message: 'Failed to toggle item feature status' });
  }
});

// @route   DELETE /api/admin/items/:itemId
// @desc    Remove an item (admin override)
// @access  Private (Admin only)
router.delete('/items/:itemId', validateObjectId('itemId'), async (req, res) => {
  try {
    const { reason } = req.body;

    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update status to removed instead of deleting
    item.status = 'removed';
    if (reason) {
      item.adminNotes = reason;
    }

    await item.save();

    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

// @route   GET /api/admin/users
// @desc    Get users for admin management
// @access  Private (Admin only)
router.get('/users', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
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
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// @route   PUT /api/admin/users/:userId/verify
// @desc    Verify a user account
// @access  Private (Admin only)
router.put('/users/:userId/verify', validateObjectId('userId'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      message: 'User verified successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Failed to verify user' });
  }
});

// @route   PUT /api/admin/users/:userId/deactivate
// @desc    Deactivate a user account
// @access  Private (Admin only)
router.put('/users/:userId/deactivate', validateObjectId('userId'), async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate admin accounts' });
    }

    user.isActive = false;
    await user.save();

    // Also deactivate all user's items
    await Item.updateMany(
      { owner: user._id },
      { status: 'removed' }
    );

    res.json({
      message: 'User deactivated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Failed to deactivate user' });
  }
});

// @route   PUT /api/admin/users/:userId/activate
// @desc    Activate a user account
// @access  Private (Admin only)
router.put('/users/:userId/activate', validateObjectId('userId'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({
      message: 'User activated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ message: 'Failed to activate user' });
  }
});

// @route   PUT /api/admin/users/:userId/points
// @desc    Adjust user points
// @access  Private (Admin only)
router.put('/users/:userId/points', validateObjectId('userId'), async (req, res) => {
  try {
    const { points, reason } = req.body;

    if (typeof points !== 'number') {
      return res.status(400).json({ message: 'Points must be a number' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldPoints = user.points;
    user.points = Math.max(0, user.points + points);
    await user.save();

    res.json({
      message: `Points adjusted successfully (${oldPoints} → ${user.points})`,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Adjust user points error:', error);
    res.status(500).json({ message: 'Failed to adjust user points' });
  }
});

// @route   GET /api/admin/swaps
// @desc    Get swaps for admin monitoring
// @access  Private (Admin only)
router.get('/swaps', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate('initiator', 'username firstName lastName email')
      .populate('recipient', 'username firstName lastName email')
      .populate('requestedItem', 'title status')
      .populate('offeredItem', 'title status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Swap.countDocuments(query);

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
    console.error('Get admin swaps error:', error);
    res.status(500).json({ message: 'Failed to get swaps' });
  }
});

// @route   GET /api/admin/reports
// @desc    Get platform reports and analytics
// @access  Private (Admin only)
router.get('/reports', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Item listing trends
    const itemListings = await Item.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Swap completion trends
    const swapCompletions = await Swap.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Category distribution
    const categoryDistribution = await Item.aggregate([
      {
        $match: {
          status: 'available'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Top users by activity
    const topUsers = await User.aggregate([
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'owner',
          as: 'items'
        }
      },
      {
        $lookup: {
          from: 'swaps',
          localField: '_id',
          foreignField: 'initiator',
          as: 'initiatedSwaps'
        }
      },
      {
        $lookup: {
          from: 'swaps',
          localField: '_id',
          foreignField: 'recipient',
          as: 'receivedSwaps'
        }
      },
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          points: 1,
          itemCount: { $size: '$items' },
          swapCount: { $add: [{ $size: '$initiatedSwaps' }, { $size: '$receivedSwaps' }] }
        }
      },
      {
        $sort: { itemCount: -1, swapCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      trends: {
        userRegistrations,
        itemListings,
        swapCompletions
      },
      categoryDistribution,
      topUsers
    });
  } catch (error) {
    console.error('Get admin reports error:', error);
    res.status(500).json({ message: 'Failed to get reports' });
  }
});

module.exports = router; 