import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { Property, User, Offer, Favorite } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// @route   GET /api/properties
// @desc    Get all properties with filtering
// @access  Public
router.get('/', async (req, res) => {
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

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: properties } = await Property.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      properties,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Server error fetching properties' });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property by ID
// @access  Public
router.get('/:id', async (req, res) => {
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
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment view count
    await property.increment('view_count');

    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Server error fetching property' });
  }
});

// @route   POST /api/properties
// @desc    Create a new property listing
// @access  Private (Seller only)
router.post('/', protect, authorize('seller', 'admin'), async (req, res) => {
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
    console.error('Error creating property:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error creating property' });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update a property
// @access  Private (Owner or Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
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
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Server error updating property' });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete a property
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await property.destroy();

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Server error deleting property' });
  }
});

// @route   GET /api/properties/seller/my-listings
// @desc    Get current seller's properties
// @access  Private (Seller)
router.get('/seller/my-listings', protect, authorize('seller', 'admin'), async (req, res) => {
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
    console.error('Error fetching seller properties:', error);
    res.status(500).json({ message: 'Server error fetching properties' });
  }
});

// @route   POST /api/properties/:id/favorite
// @desc    Toggle favorite on a property
// @access  Private
router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
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
      res.json({ message: 'Removed from favorites', favorited: false });
    } else {
      await Favorite.create({
        user_id: req.user.id,
        property_id: req.params.id,
      });
      await property.increment('favorite_count');
      res.json({ message: 'Added to favorites', favorited: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/properties/favorites/my-favorites
// @desc    Get user's favorite properties
// @access  Private
router.get('/favorites/my-favorites', protect, async (req, res) => {
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
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
});

export default router;
