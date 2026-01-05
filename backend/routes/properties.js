import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { Property, User, Offer, Favorite } from '../models/index.js';
import { Op } from 'sequelize';
import { propertyValidation, uuidParam } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// =====================================================
// SPECIFIC ROUTES (must come before parameterized routes)
// =====================================================

// @route   GET /api/properties/seller/my-listings
// @desc    Get current seller's properties
// @access  Private (Seller)
router.get('/seller/my-listings', protect, authorize('seller', 'admin'), async (req, res, next) => {
  try {
    const properties = await Property.findAll({
      where: { seller_id: req.user.id },
      include: [
        {
          model: Offer,
          as: 'offers',
          include: [
            {
              model: User,
              as: 'buyer',
              attributes: ['id', 'first_name', 'last_name', 'email'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(properties);
  } catch (error) {
    logger.error('Error fetching seller properties:', { error: error.message, userId: req.user.id });
    next(error);
  }
});

// @route   GET /api/properties/favorites/my-favorites
// @desc    Get user's favorite properties
// @access  Private
router.get('/favorites/my-favorites', protect, async (req, res, next) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Property,
          as: 'property',
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(favorites.map(f => f.property));
  } catch (error) {
    logger.error('Error fetching favorites:', { error: error.message, userId: req.user.id });
    next(error);
  }
});

// =====================================================
// GENERAL ROUTES
// =====================================================

// @route   GET /api/properties
// @desc    Get all properties with filtering
// @access  Public
router.get('/', propertyValidation.list, async (req, res, next) => {
  try {
    const {
      city,
      state,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      property_type,
      status = 'active',
      search,
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'DESC',
    } = req.query;

    const where = {};

    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['created_at', 'list_price', 'bedrooms', 'bathrooms', 'sqft'];
    const safeSort = allowedSortFields.includes(sort) ? sort : 'created_at';
    const safeOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    if (status) where.status = status;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (state) where.state = state;
    if (property_type) where.property_type = property_type;
    if (bedrooms) where.bedrooms = { [Op.gte]: parseInt(bedrooms) };
    if (bathrooms) where.bathrooms = { [Op.gte]: parseFloat(bathrooms) };
    if (minPrice || maxPrice) {
      where.list_price = {};
      if (minPrice) where.list_price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.list_price[Op.lte] = parseFloat(maxPrice);
    }
    if (search) {
      where[Op.or] = [
        { address_line1: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Enforce pagination limits
    const pageNum = Math.max(1, Math.min(1000, parseInt(page) || 1));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: properties } = await Property.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
      ],
      order: [[safeSort, safeOrder]],
      limit: limitNum,
      offset,
    });

    res.json({
      properties,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error fetching properties:', { error: error.message });
    next(error);
  }
});

// @route   POST /api/properties
// @desc    Create a new property listing
// @access  Private (Seller only)
router.post('/', protect, authorize('seller', 'admin'), propertyValidation.create, async (req, res, next) => {
  try {
    const propertyData = {
      ...req.body,
      seller_id: req.user.id,
      status: 'active',
    };

    const property = await Property.create(propertyData);

    const propertyWithSeller = await Property.findByPk(property.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
      ],
    });

    res.status(201).json(propertyWithSeller);
  } catch (error) {
    logger.error('Error creating property:', { error: error.message, userId: req.user.id });
    next(error);
  }
});

// =====================================================
// PARAMETERIZED ROUTES (must come after specific routes)
// =====================================================

// @route   GET /api/properties/:id
// @desc    Get single property by ID
// @access  Public
router.get('/:id', propertyValidation.getById, async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
        {
          model: Offer,
          as: 'offers',
          include: [
            {
              model: User,
              as: 'buyer',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Increment view count
    await property.increment('view_count');

    res.json(property);
  } catch (error) {
    logger.error('Error fetching property:', { error: error.message, propertyId: req.params.id });
    next(error);
  }
});

// @route   PUT /api/properties/:id
// @desc    Update a property
// @access  Private (Owner or Admin)
router.put('/:id', protect, propertyValidation.update, async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Check ownership
    if (property.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this property' });
    }

    // Don't allow changing seller_id
    const { seller_id, ...updateData } = req.body;

    await property.update(updateData);

    const updatedProperty = await Property.findByPk(property.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
      ],
    });

    res.json(updatedProperty);
  } catch (error) {
    logger.error('Error updating property:', { error: error.message, propertyId: req.params.id });
    next(error);
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete a property
// @access  Private (Owner or Admin)
router.delete('/:id', protect, uuidParam('id'), async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Check ownership
    if (property.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this property' });
    }

    await property.destroy();

    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    logger.error('Error deleting property:', { error: error.message, propertyId: req.params.id });
    next(error);
  }
});

// @route   POST /api/properties/:id/favorite
// @desc    Toggle favorite on a property
// @access  Private
router.post('/:id/favorite', protect, uuidParam('id'), async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const existingFavorite = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        property_id: req.params.id,
      },
    });

    if (existingFavorite) {
      await existingFavorite.destroy();
      await property.decrement('favorite_count');
      res.json({ success: true, message: 'Removed from favorites', favorited: false });
    } else {
      await Favorite.create({
        user_id: req.user.id,
        property_id: req.params.id,
      });
      await property.increment('favorite_count');
      res.json({ success: true, message: 'Added to favorites', favorited: true });
    }
  } catch (error) {
    logger.error('Error toggling favorite:', { error: error.message, propertyId: req.params.id });
    next(error);
  }
});

export default router;
