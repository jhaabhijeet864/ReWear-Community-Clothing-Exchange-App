const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Item = require('../models/Item');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { 
  validateItemCreation, 
  validateItemUpdate, 
  validatePagination, 
  validateObjectId,
  validateSearch 
} = require('../middleware/validation');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/items';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 images per item
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   POST /api/items
// @desc    Create a new item
// @access  Private
router.post('/', authenticateToken, upload.array('images', 5), validateItemCreation, async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      owner: req.user._id,
      images: []
    };

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      itemData.images = req.files.map((file, index) => ({
        url: `/uploads/items/${file.filename}`,
        publicId: file.filename,
        isPrimary: index === 0 // First image is primary
      }));
    }

    const item = new Item(itemData);
    await item.save();

    // Populate owner info
    await item.populate('owner', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Item created successfully',
      item: item.getPublicData()
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Failed to create item' });
  }
});

// @route   GET /api/items
// @desc    Get all items with search and filters
// @access  Public
router.get('/', optionalAuth, validateSearch, validatePagination, async (req, res) => {
  try {
    const { 
      q, category, type, size, condition, swapType, 
      page = 1, limit = 12, sort = 'newest' 
    } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'available' };
    let sortOptions = {};

    // Search query
    if (q) {
      query.$text = { $search: q };
    }

    // Filters
    if (category) query.category = category;
    if (type) query.type = type;
    if (size) query.size = size;
    if (condition) query.condition = condition;
    if (swapType) query.swapType = swapType;

    // Sort options
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'price-high':
        sortOptions = { pointsValue: -1 };
        break;
      case 'price-low':
        sortOptions = { pointsValue: 1 };
        break;
      case 'popular':
        sortOptions = { views: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const items = await Item.find(query)
      .populate('owner', 'username firstName lastName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments(query);

    // Add like status for authenticated users
    if (req.user) {
      items.forEach(item => {
        item._doc.isLiked = item.isLikedBy(req.user._id);
      });
    }

    res.json({
      items: items.map(item => item.getPublicData()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Failed to get items' });
  }
});

// @route   GET /api/items/featured
// @desc    Get featured items
// @access  Public
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const items = await Item.getFeaturedItems(8);

    // Add like status for authenticated users
    if (req.user) {
      items.forEach(item => {
        item._doc.isLiked = item.isLikedBy(req.user._id);
      });
    }

    res.json({
      items: items.map(item => item.getPublicData())
    });
  } catch (error) {
    console.error('Get featured items error:', error);
    res.status(500).json({ message: 'Failed to get featured items' });
  }
});

// @route   GET /api/items/:itemId
// @desc    Get item by ID
// @access  Public
router.get('/:itemId', optionalAuth, validateObjectId('itemId'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId)
      .populate('owner', 'username firstName lastName avatar bio location');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'available' && (!req.user || req.user._id.toString() !== item.owner._id.toString())) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment views
    await item.incrementViews();

    // Add like status for authenticated users
    if (req.user) {
      item._doc.isLiked = item.isLikedBy(req.user._id);
    }

    res.json({
      item: item.getPublicData()
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Failed to get item' });
  }
});

// @route   PUT /api/items/:itemId
// @desc    Update item
// @access  Private (owner only)
router.put('/:itemId', authenticateToken, upload.array('images', 5), validateItemUpdate, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updateData = { ...req.body };

    // Process new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/items/${file.filename}`,
        publicId: file.filename,
        isPrimary: index === 0 && item.images.length === 0
      }));

      updateData.images = [...item.images, ...newImages];
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.itemId,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'username firstName lastName avatar');

    res.json({
      message: 'Item updated successfully',
      item: updatedItem.getPublicData()
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Failed to update item' });
  }
});

// @route   DELETE /api/items/:itemId
// @desc    Delete item
// @access  Private (owner only)
router.delete('/:itemId', authenticateToken, validateObjectId('itemId'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // Delete image files
    if (item.images && item.images.length > 0) {
      item.images.forEach(image => {
        const imagePath = path.join(__dirname, '..', image.url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    await Item.findByIdAndDelete(req.params.itemId);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

// @route   POST /api/items/:itemId/like
// @desc    Toggle like on item
// @access  Private
router.post('/:itemId/like', authenticateToken, validateObjectId('itemId'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ message: 'Cannot like unavailable item' });
    }

    await item.toggleLike(req.user._id);

    res.json({
      message: 'Like toggled successfully',
      isLiked: item.isLikedBy(req.user._id),
      likeCount: item.likeCount
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
});

// @route   DELETE /api/items/:itemId/images/:imageId
// @desc    Delete specific image from item
// @access  Private (owner only)
router.delete('/:itemId/images/:imageId', authenticateToken, validateObjectId('itemId'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this item' });
    }

    const imageIndex = item.images.findIndex(img => img.publicId === req.params.imageId);
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '..', item.images[imageIndex].url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove image from array
    item.images.splice(imageIndex, 1);

    // If primary image was deleted, make first image primary
    if (item.images.length > 0 && !item.images.some(img => img.isPrimary)) {
      item.images[0].isPrimary = true;
    }

    await item.save();

    res.json({
      message: 'Image deleted successfully',
      item: item.getPublicData()
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// @route   POST /api/items/:itemId/images/primary
// @desc    Set primary image
// @access  Private (owner only)
router.post('/:itemId/images/primary', authenticateToken, validateObjectId('itemId'), async (req, res) => {
  try {
    const { imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' });
    }

    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this item' });
    }

    // Reset all images to not primary
    item.images.forEach(img => {
      img.isPrimary = false;
    });

    // Set specified image as primary
    const targetImage = item.images.find(img => img.publicId === imageId);
    if (!targetImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    targetImage.isPrimary = true;
    await item.save();

    res.json({
      message: 'Primary image set successfully',
      item: item.getPublicData()
    });
  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({ message: 'Failed to set primary image' });
  }
});

// @route   GET /api/items/categories
// @desc    Get available categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'tops', label: 'Tops' },
      { value: 'bottoms', label: 'Bottoms' },
      { value: 'dresses', label: 'Dresses' },
      { value: 'outerwear', label: 'Outerwear' },
      { value: 'shoes', label: 'Shoes' },
      { value: 'accessories', label: 'Accessories' },
      { value: 'jewelry', label: 'Jewelry' },
      { value: 'bags', label: 'Bags' },
      { value: 'hats', label: 'Hats' },
      { value: 'scarves', label: 'Scarves' }
    ];

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to get categories' });
  }
});

// @route   GET /api/items/types
// @desc    Get available types
// @access  Public
router.get('/types', async (req, res) => {
  try {
    const types = [
      { value: 'casual', label: 'Casual' },
      { value: 'formal', label: 'Formal' },
      { value: 'business', label: 'Business' },
      { value: 'sportswear', label: 'Sportswear' },
      { value: 'vintage', label: 'Vintage' },
      { value: 'streetwear', label: 'Streetwear' },
      { value: 'bohemian', label: 'Bohemian' },
      { value: 'minimalist', label: 'Minimalist' },
      { value: 'luxury', label: 'Luxury' },
      { value: 'eco-friendly', label: 'Eco-Friendly' }
    ];

    res.json({ types });
  } catch (error) {
    console.error('Get types error:', error);
    res.status(500).json({ message: 'Failed to get types' });
  }
});

module.exports = router; 