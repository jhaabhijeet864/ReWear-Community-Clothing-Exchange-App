const express = require('express');
const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');
const { authenticateToken, requireSwapAccess } = require('../middleware/auth');
const { validateSwapCreation, validateRating, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/swaps
// @desc    Create a new swap request
// @access  Private
router.post('/', authenticateToken, validateSwapCreation, async (req, res) => {
  try {
    const { type, requestedItem, offeredItem, pointsAmount, message } = req.body;

    // Check if requested item exists and is available
    const requestedItemDoc = await Item.findById(requestedItem);
    if (!requestedItemDoc) {
      return res.status(404).json({ message: 'Requested item not found' });
    }

    if (requestedItemDoc.status !== 'available') {
      return res.status(400).json({ message: 'Requested item is not available' });
    }

    // Check if user is not trying to swap their own item
    if (requestedItemDoc.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot swap your own item' });
    }

    // Validate swap type compatibility
    if (type === 'direct') {
      if (!offeredItem) {
        return res.status(400).json({ message: 'Offered item is required for direct swaps' });
      }

      const offeredItemDoc = await Item.findById(offeredItem);
      if (!offeredItemDoc) {
        return res.status(404).json({ message: 'Offered item not found' });
      }

      if (offeredItemDoc.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only offer your own items' });
      }

      if (offeredItemDoc.status !== 'available') {
        return res.status(400).json({ message: 'Offered item is not available' });
      }

      // Check if offered item supports direct swaps
      if (!['direct', 'both'].includes(offeredItemDoc.swapType)) {
        return res.status(400).json({ message: 'Offered item does not support direct swaps' });
      }
    } else if (type === 'points') {
      if (!pointsAmount || pointsAmount <= 0) {
        return res.status(400).json({ message: 'Valid points amount is required for points swaps' });
      }

      // Check if user has enough points
      if (req.user.points < pointsAmount) {
        return res.status(400).json({ message: 'Insufficient points for this swap' });
      }

      // Check if requested item supports points swaps
      if (!['points', 'both'].includes(requestedItemDoc.swapType)) {
        return res.status(400).json({ message: 'Requested item does not support points swaps' });
      }

      // Check if points amount is reasonable (within 50% of item's points value)
      if (requestedItemDoc.pointsValue > 0) {
        const minPoints = Math.max(1, Math.floor(requestedItemDoc.pointsValue * 0.5));
        const maxPoints = Math.ceil(requestedItemDoc.pointsValue * 1.5);
        
        if (pointsAmount < minPoints || pointsAmount > maxPoints) {
          return res.status(400).json({ 
            message: `Points amount should be between ${minPoints} and ${maxPoints}` 
          });
        }
      }
    }

    // Check if there's already a pending swap for this item
    const existingSwap = await Swap.findOne({
      requestedItem,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingSwap) {
      return res.status(400).json({ message: 'This item already has a pending swap request' });
    }

    // Create the swap
    const swap = new Swap({
      type,
      initiator: req.user._id,
      recipient: requestedItemDoc.owner,
      requestedItem,
      offeredItem: type === 'direct' ? offeredItem : undefined,
      pointsAmount: type === 'points' ? pointsAmount : undefined,
      message
    });

    await swap.save();

    // Populate the swap with item and user details
    await swap.populate([
      { path: 'initiator', select: 'username firstName lastName avatar' },
      { path: 'recipient', select: 'username firstName lastName avatar' },
      { path: 'requestedItem', select: 'title images status' },
      { path: 'offeredItem', select: 'title images status' }
    ]);

    res.status(201).json({
      message: 'Swap request created successfully',
      swap
    });
  } catch (error) {
    console.error('Create swap error:', error);
    res.status(500).json({ message: 'Failed to create swap request' });
  }
});

// @route   GET /api/swaps
// @desc    Get user's swaps
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
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
    console.error('Get swaps error:', error);
    res.status(500).json({ message: 'Failed to get swaps' });
  }
});

// @route   GET /api/swaps/pending
// @desc    Get pending swaps for current user
// @access  Private
router.get('/pending', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const swaps = await Swap.getPendingSwaps(req.user._id)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Swap.countDocuments({
      recipient: req.user._id,
      status: 'pending'
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
    console.error('Get pending swaps error:', error);
    res.status(500).json({ message: 'Failed to get pending swaps' });
  }
});

// @route   GET /api/swaps/:swapId
// @desc    Get specific swap details
// @access  Private (participants only)
router.get('/:swapId', authenticateToken, requireSwapAccess, async (req, res) => {
  try {
    await req.swap.populate([
      { path: 'initiator', select: 'username firstName lastName avatar' },
      { path: 'recipient', select: 'username firstName lastName avatar' },
      { path: 'requestedItem', select: 'title images status owner' },
      { path: 'offeredItem', select: 'title images status owner' }
    ]);

    res.json({ swap: req.swap });
  } catch (error) {
    console.error('Get swap error:', error);
    res.status(500).json({ message: 'Failed to get swap details' });
  }
});

// @route   PUT /api/swaps/:swapId/accept
// @desc    Accept a swap request
// @access  Private (recipient only)
router.put('/:swapId/accept', authenticateToken, requireSwapAccess, async (req, res) => {
  try {
    const swap = req.swap;

    // Check if user is the recipient
    if (swap.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the recipient can accept swap requests' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Can only accept pending swap requests' });
    }

    // For points swaps, check if recipient has enough points
    if (swap.type === 'points') {
      const recipient = await User.findById(req.user._id);
      if (recipient.points < swap.pointsAmount) {
        return res.status(400).json({ message: 'Insufficient points to accept this swap' });
      }
    }

    // Accept the swap
    await swap.accept();

    // Update item statuses
    await Item.findByIdAndUpdate(swap.requestedItem, { status: 'reserved' });
    if (swap.offeredItem) {
      await Item.findByIdAndUpdate(swap.offeredItem, { status: 'reserved' });
    }

    // Populate swap details
    await swap.populate([
      { path: 'initiator', select: 'username firstName lastName avatar' },
      { path: 'recipient', select: 'username firstName lastName avatar' },
      { path: 'requestedItem', select: 'title images status' },
      { path: 'offeredItem', select: 'title images status' }
    ]);

    res.json({
      message: 'Swap request accepted successfully',
      swap
    });
  } catch (error) {
    console.error('Accept swap error:', error);
    res.status(500).json({ message: 'Failed to accept swap request' });
  }
});

// @route   PUT /api/swaps/:swapId/reject
// @desc    Reject a swap request
// @access  Private (recipient only)
router.put('/:swapId/reject', authenticateToken, requireSwapAccess, async (req, res) => {
  try {
    const swap = req.swap;

    // Check if user is the recipient
    if (swap.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the recipient can reject swap requests' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Can only reject pending swap requests' });
    }

    // Reject the swap
    await swap.reject();

    // Populate swap details
    await swap.populate([
      { path: 'initiator', select: 'username firstName lastName avatar' },
      { path: 'recipient', select: 'username firstName lastName avatar' },
      { path: 'requestedItem', select: 'title images status' },
      { path: 'offeredItem', select: 'title images status' }
    ]);

    res.json({
      message: 'Swap request rejected successfully',
      swap
    });
  } catch (error) {
    console.error('Reject swap error:', error);
    res.status(500).json({ message: 'Failed to reject swap request' });
  }
});

// @route   PUT /api/swaps/:swapId/complete
// @desc    Complete a swap
// @access  Private (participants only)
router.put('/:swapId/complete', authenticateToken, requireSwapAccess, async (req, res) => {
  try {
    const swap = req.swap;

    if (swap.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only complete accepted swaps' });
    }

    // Complete the swap
    await swap.complete();

    // Update item statuses and ownership
    if (swap.type === 'direct') {
      // For direct swaps, swap the ownership
      const requestedItem = await Item.findById(swap.requestedItem);
      const offeredItem = await Item.findById(swap.offeredItem);

      // Update ownership
      requestedItem.owner = swap.initiator;
      requestedItem.status = 'swapped';
      offeredItem.owner = swap.recipient;
      offeredItem.status = 'swapped';

      await requestedItem.save();
      await offeredItem.save();
    } else if (swap.type === 'points') {
      // For points swaps, transfer points and update item ownership
      const requestedItem = await Item.findById(swap.requestedItem);
      requestedItem.owner = swap.initiator;
      requestedItem.status = 'swapped';
      await requestedItem.save();

      // Transfer points
      const initiator = await User.findById(swap.initiator);
      const recipient = await User.findById(swap.recipient);

      await initiator.deductPoints(swap.pointsAmount);
      await recipient.addPoints(swap.pointsAmount);
    }

    // Populate swap details
    await swap.populate([
      { path: 'initiator', select: 'username firstName lastName avatar' },
      { path: 'recipient', select: 'username firstName lastName avatar' },
      { path: 'requestedItem', select: 'title images status' },
      { path: 'offeredItem', select: 'title images status' }
    ]);

    res.json({
      message: 'Swap completed successfully',
      swap
    });
  } catch (error) {
    console.error('Complete swap error:', error);
    res.status(500).json({ message: 'Failed to complete swap' });
  }
});

// @route   PUT /api/swaps/:swapId/cancel
// @desc    Cancel a swap
// @access  Private (participants only)
router.put('/:swapId/cancel', authenticateToken, requireSwapAccess, async (req, res) => {
  try {
    const swap = req.swap;
    const { reason } = req.body;

    if (!['pending', 'accepted'].includes(swap.status)) {
      return res.status(400).json({ message: 'Can only cancel pending or accepted swaps' });
    }

    // Cancel the swap
    await swap.cancel(req.user._id, reason);

    // Reset item statuses if swap was accepted
    if (swap.status === 'accepted') {
      await Item.findByIdAndUpdate(swap.requestedItem, { status: 'available' });
      if (swap.offeredItem) {
        await Item.findByIdAndUpdate(swap.offeredItem, { status: 'available' });
      }
    }

    // Populate swap details
    await swap.populate([
      { path: 'initiator', select: 'username firstName lastName avatar' },
      { path: 'recipient', select: 'username firstName lastName avatar' },
      { path: 'requestedItem', select: 'title images status' },
      { path: 'offeredItem', select: 'title images status' }
    ]);

    res.json({
      message: 'Swap cancelled successfully',
      swap
    });
  } catch (error) {
    console.error('Cancel swap error:', error);
    res.status(500).json({ message: 'Failed to cancel swap' });
  }
});

// @route   POST /api/swaps/:swapId/rate
// @desc    Rate a completed swap
// @access  Private (participants only)
router.post('/:swapId/rate', authenticateToken, requireSwapAccess, validateRating, async (req, res) => {
  try {
    const swap = req.swap;
    const { rating, comment } = req.body;

    if (swap.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed swaps' });
    }

    // Add rating
    await swap.addRating(req.user._id, rating, comment);

    // Populate swap details
    await swap.populate([
      { path: 'initiator', select: 'username firstName lastName avatar' },
      { path: 'recipient', select: 'username firstName lastName avatar' },
      { path: 'requestedItem', select: 'title images status' },
      { path: 'offeredItem', select: 'title images status' }
    ]);

    res.json({
      message: 'Rating added successfully',
      swap
    });
  } catch (error) {
    console.error('Rate swap error:', error);
    res.status(500).json({ message: 'Failed to add rating' });
  }
});

// @route   GET /api/swaps/stats
// @desc    Get swap statistics for current user
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Swap.getSwapStats(req.user._id);

    const formattedStats = {
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.json({ stats: formattedStats });
  } catch (error) {
    console.error('Get swap stats error:', error);
    res.status(500).json({ message: 'Failed to get swap statistics' });
  }
});

module.exports = router; 