const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Item creation validation
const validateItemCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'jewelry', 'bags', 'hats', 'scarves'])
    .withMessage('Invalid category'),
  body('type')
    .isIn(['casual', 'formal', 'business', 'sportswear', 'vintage', 'streetwear', 'bohemian', 'minimalist', 'luxury', 'eco-friendly'])
    .withMessage('Invalid type'),
  body('size')
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', 'one-size', 'custom'])
    .withMessage('Invalid size'),
  body('condition')
    .isIn(['new', 'like-new', 'excellent', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
  body('color')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Color must be between 1 and 30 characters'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand name cannot exceed 50 characters'),
  body('material')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Material cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  body('swapType')
    .isIn(['direct', 'points', 'both'])
    .withMessage('Invalid swap type'),
  body('pointsValue')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points value must be a non-negative integer'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  handleValidationErrors
];

// Item update validation
const validateItemUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .optional()
    .isIn(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'jewelry', 'bags', 'hats', 'scarves'])
    .withMessage('Invalid category'),
  body('type')
    .optional()
    .isIn(['casual', 'formal', 'business', 'sportswear', 'vintage', 'streetwear', 'bohemian', 'minimalist', 'luxury', 'eco-friendly'])
    .withMessage('Invalid type'),
  body('size')
    .optional()
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', 'one-size', 'custom'])
    .withMessage('Invalid size'),
  body('condition')
    .optional()
    .isIn(['new', 'like-new', 'excellent', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
  body('color')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Color must be between 1 and 30 characters'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand name cannot exceed 50 characters'),
  body('material')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Material cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  body('swapType')
    .optional()
    .isIn(['direct', 'points', 'both'])
    .withMessage('Invalid swap type'),
  body('pointsValue')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points value must be a non-negative integer'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  handleValidationErrors
];

// Swap creation validation
const validateSwapCreation = [
  body('type')
    .isIn(['direct', 'points'])
    .withMessage('Invalid swap type'),
  body('requestedItem')
    .isMongoId()
    .withMessage('Invalid requested item ID'),
  body('offeredItem')
    .if(body('type').equals('direct'))
    .isMongoId()
    .withMessage('Offered item ID is required for direct swaps'),
  body('pointsAmount')
    .if(body('type').equals('points'))
    .isInt({ min: 1 })
    .withMessage('Points amount must be a positive integer for points swaps'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
  handleValidationErrors
];

// Rating validation
const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Comment cannot exceed 200 characters'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('category')
    .optional()
    .isIn(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'jewelry', 'bags', 'hats', 'scarves'])
    .withMessage('Invalid category filter'),
  query('type')
    .optional()
    .isIn(['casual', 'formal', 'business', 'sportswear', 'vintage', 'streetwear', 'bohemian', 'minimalist', 'luxury', 'eco-friendly'])
    .withMessage('Invalid type filter'),
  query('size')
    .optional()
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', 'one-size', 'custom'])
    .withMessage('Invalid size filter'),
  query('condition')
    .optional()
    .isIn(['new', 'like-new', 'excellent', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition filter'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateItemCreation,
  validateItemUpdate,
  validateSwapCreation,
  validateRating,
  validatePagination,
  validateObjectId,
  validateSearch
}; 