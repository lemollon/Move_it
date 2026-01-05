import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg).join(', ');
    throw new AppError(messages, 400);
  }
  next();
};

/**
 * Sanitize string inputs - trim and escape HTML
 */
const sanitizeString = (fieldName) =>
  body(fieldName).optional().trim().escape();

/**
 * Auth validation rules
 */
export const authValidation = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must be less than 255 characters'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('role')
      .isIn(['buyer', 'seller', 'vendor'])
      .withMessage('Invalid role'),
    body('first_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters'),
    body('last_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[\d\s\-\+\(\)]+$/)
      .withMessage('Invalid phone number format')
      .isLength({ max: 20 })
      .withMessage('Phone number must be less than 20 characters'),
    validate,
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Please provide a password'),
    validate,
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    validate,
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required')
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid reset token'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    validate,
  ],

  updateDetails: [
    body('first_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters'),
    body('last_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[\d\s\-\+\(\)]+$/)
      .withMessage('Invalid phone number format'),
    validate,
  ],

  updatePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    validate,
  ],
};

/**
 * Property validation rules
 */
export const propertyValidation = {
  create: [
    body('address_line1')
      .trim()
      .notEmpty()
      .withMessage('Address is required')
      .isLength({ max: 255 })
      .withMessage('Address must be less than 255 characters'),
    body('city')
      .trim()
      .notEmpty()
      .withMessage('City is required')
      .isLength({ max: 100 })
      .withMessage('City must be less than 100 characters'),
    body('state')
      .optional()
      .trim()
      .isLength({ min: 2, max: 2 })
      .withMessage('State must be 2 characters'),
    body('zip_code')
      .trim()
      .notEmpty()
      .withMessage('ZIP code is required')
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('Invalid ZIP code format'),
    body('list_price')
      .isFloat({ min: 1, max: 999999999 })
      .withMessage('List price must be a valid amount between 1 and 999,999,999'),
    body('bedrooms')
      .optional()
      .isInt({ min: 0, max: 99 })
      .withMessage('Bedrooms must be a number between 0 and 99'),
    body('bathrooms')
      .optional()
      .isFloat({ min: 0, max: 99 })
      .withMessage('Bathrooms must be a number between 0 and 99'),
    body('sqft')
      .optional()
      .isInt({ min: 0, max: 999999 })
      .withMessage('Square footage must be a number between 0 and 999,999'),
    body('property_type')
      .optional()
      .isIn(['single_family', 'condo', 'townhouse', 'multi_family', 'land', 'other'])
      .withMessage('Invalid property type'),
    validate,
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('Invalid property ID'),
    body('list_price')
      .optional()
      .isFloat({ min: 1, max: 999999999 })
      .withMessage('List price must be a valid amount'),
    body('bedrooms')
      .optional()
      .isInt({ min: 0, max: 99 })
      .withMessage('Bedrooms must be a valid number'),
    body('bathrooms')
      .optional()
      .isFloat({ min: 0, max: 99 })
      .withMessage('Bathrooms must be a valid number'),
    validate,
  ],

  getById: [
    param('id')
      .isUUID()
      .withMessage('Invalid property ID'),
    validate,
  ],

  list: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be between 1 and 1000'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),
    query('bedrooms')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Bedrooms must be a positive number'),
    query('bathrooms')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Bathrooms must be a positive number'),
    validate,
  ],
};

/**
 * Offer validation rules
 */
export const offerValidation = {
  create: [
    body('property_id')
      .isUUID()
      .withMessage('Invalid property ID'),
    body('offer_price')
      .isFloat({ min: 1, max: 999999999 })
      .withMessage('Offer price must be a valid amount'),
    body('earnest_money')
      .isFloat({ min: 0, max: 999999999 })
      .withMessage('Earnest money must be a valid amount'),
    body('financing_type')
      .isIn(['cash', 'conventional', 'fha', 'va', 'usda', 'other'])
      .withMessage('Invalid financing type'),
    body('proposed_closing_date')
      .isISO8601()
      .withMessage('Invalid closing date')
      .custom((value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          throw new Error('Closing date must be in the future');
        }
        return true;
      }),
    body('contingencies')
      .optional()
      .isArray()
      .withMessage('Contingencies must be an array'),
    validate,
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('Invalid offer ID'),
    body('counter_price')
      .optional()
      .isFloat({ min: 1, max: 999999999 })
      .withMessage('Counter price must be a valid amount'),
    validate,
  ],

  getById: [
    param('id')
      .isUUID()
      .withMessage('Invalid offer ID'),
    validate,
  ],
};

/**
 * Transaction validation rules
 */
export const transactionValidation = {
  getById: [
    param('id')
      .isUUID()
      .withMessage('Invalid transaction ID'),
    validate,
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('Invalid transaction ID'),
    body('closing_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid closing date'),
    body('inspection_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid inspection date'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Notes must be less than 5000 characters'),
    validate,
  ],

  updateStatus: [
    param('id')
      .isUUID()
      .withMessage('Invalid transaction ID'),
    body('status')
      .isIn([
        'initiated',
        'contract_pending',
        'inspection_period',
        'appraisal_ordered',
        'title_search',
        'financing_contingency',
        'final_walkthrough',
        'closing_scheduled',
        'closed',
        'cancelled',
      ])
      .withMessage('Invalid status'),
    validate,
  ],
};

/**
 * UUID parameter validation
 */
export const uuidParam = (paramName = 'id') => [
  param(paramName)
    .isUUID()
    .withMessage(`Invalid ${paramName}`),
  validate,
];

/**
 * Pagination query validation
 */
export const paginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate,
];
