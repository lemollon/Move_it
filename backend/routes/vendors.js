import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { Vendor, User } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// @route   GET /api/vendors
// @desc    Get all vendors with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      vendor_type,
      service_area,
      tier,
      search,
      page = 1,
      limit = 20,
      sort = 'rating',
      order = 'DESC',
    } = req.query;

    const where = {
      verified: true,
    };

    if (vendor_type) where.vendor_type = vendor_type;
    if (tier) where.tier = tier;
    if (service_area) {
      where.service_areas = {
        [Op.contains]: [service_area],
      };
    }
    if (search) {
      where[Op.or] = [
        { business_name: { [Op.iLike]: `%${search}%` } },
        { '$user.first_name$': { [Op.iLike]: `%${search}%` } },
        { '$user.last_name$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: vendors } = await Vendor.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      vendors,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error fetching vendors' });
  }
});

// @route   GET /api/vendors/:id
// @desc    Get single vendor profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
      ],
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Server error fetching vendor' });
  }
});

// @route   GET /api/vendors/profile/me
// @desc    Get current vendor's profile
// @access  Private (Vendor)
router.get('/profile/me', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
      ],
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/vendors
// @desc    Create vendor profile
// @access  Private (Vendor role)
router.post('/', protect, authorize('vendor'), async (req, res) => {
  try {
    // Check if vendor profile already exists
    const existingVendor = await Vendor.findOne({
      where: { user_id: req.user.id },
    });

    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor profile already exists' });
    }

    const {
      business_name,
      vendor_type,
      license_number,
      license_expiry,
      service_areas,
      bio,
      website,
      tier = 'FREE',
    } = req.body;

    const vendor = await Vendor.create({
      user_id: req.user.id,
      business_name,
      vendor_type,
      license_number,
      license_expiry,
      service_areas: service_areas || [],
      bio,
      website,
      tier,
      verified: false,
    });

    const vendorWithUser = await Vendor.findByPk(vendor.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
      ],
    });

    res.status(201).json(vendorWithUser);
  } catch (error) {
    console.error('Error creating vendor profile:', error);
    res.status(500).json({ message: 'Server error creating vendor profile' });
  }
});

// @route   PUT /api/vendors/profile
// @desc    Update vendor profile
// @access  Private (Vendor)
router.put('/profile', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      where: { user_id: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const allowedUpdates = [
      'business_name',
      'license_number',
      'license_expiry',
      'service_areas',
      'bio',
      'website',
      'insurance_info',
      'certifications',
      'years_experience',
      'portfolio_url',
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await vendor.update(updates);

    const updatedVendor = await Vendor.findByPk(vendor.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
      ],
    });

    res.json(updatedVendor);
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @route   POST /api/vendors/upgrade
// @desc    Upgrade vendor tier
// @access  Private (Vendor)
router.post('/upgrade', protect, authorize('vendor'), async (req, res) => {
  try {
    const { tier } = req.body;

    if (!['FREE', 'STANDARD', 'PREMIUM'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid tier' });
    }

    const vendor = await Vendor.findOne({
      where: { user_id: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // In production, you'd integrate with a payment system here
    vendor.tier = tier;
    if (tier !== 'FREE') {
      vendor.subscription_start = new Date();
      vendor.subscription_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
    await vendor.save();

    res.json({
      message: `Upgraded to ${tier} tier`,
      vendor,
    });
  } catch (error) {
    console.error('Error upgrading vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/vendors/types/list
// @desc    Get list of vendor types
// @access  Public
router.get('/types/list', async (req, res) => {
  const vendorTypes = [
    { value: 'title_company', label: 'Title Company' },
    { value: 'inspector', label: 'Home Inspector' },
    { value: 'appraiser', label: 'Appraiser' },
    { value: 'mortgage_lender', label: 'Mortgage Lender' },
    { value: 'insurance', label: 'Insurance Provider' },
    { value: 'surveyor', label: 'Surveyor' },
    { value: 'photographer', label: 'Photographer' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'moving_company', label: 'Moving Company' },
    { value: 'cleaning_service', label: 'Cleaning Service' },
    { value: 'other', label: 'Other' },
  ];

  res.json(vendorTypes);
});

export default router;
