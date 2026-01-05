import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { SharedDisclosure, SellerDisclosure, Property, User } from '../models/index.js';
import { analyticsService } from '../services/analyticsService.js';

/**
 * @desc    Get all disclosures shared with the logged-in buyer
 * @route   GET /api/buyer/disclosures
 * @access  Private
 */
export const getBuyerDisclosures = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;

  // Find disclosures shared with this user (by user_id or email)
  const sharedDisclosures = await SharedDisclosure.findAll({
    where: {
      [require('sequelize').Op.or]: [
        { recipient_user_id: userId },
        { recipient_email: userEmail },
      ],
    },
    include: [
      {
        model: SellerDisclosure,
        as: 'disclosure',
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'address', 'city', 'state', 'zip_code', 'price', 'images'],
          },
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'first_name', 'last_name', 'email'],
          },
        ],
      },
      {
        model: User,
        as: 'sharer',
        attributes: ['id', 'first_name', 'last_name', 'email'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  // Update recipient_user_id if it was shared by email before user registered
  for (const shared of sharedDisclosures) {
    if (!shared.recipient_user_id && shared.recipient_email === userEmail) {
      await shared.update({ recipient_user_id: userId });
    }
  }

  res.json({
    success: true,
    count: sharedDisclosures.length,
    disclosures: sharedDisclosures.map(sd => ({
      id: sd.id,
      disclosureId: sd.disclosure_id,
      status: sd.status,
      sharedAt: sd.created_at,
      viewCount: sd.view_count,
      firstViewedAt: sd.first_viewed_at,
      acknowledgedAt: sd.acknowledged_at,
      signedAt: sd.signed_at,
      message: sd.message,
      property: sd.disclosure?.property ? {
        id: sd.disclosure.property.id,
        address: sd.disclosure.property.address,
        city: sd.disclosure.property.city,
        state: sd.disclosure.property.state,
        zipCode: sd.disclosure.property.zip_code,
        price: sd.disclosure.property.price,
        image: sd.disclosure.property.images?.[0] || null,
      } : null,
      seller: sd.disclosure?.seller ? {
        name: `${sd.disclosure.seller.first_name} ${sd.disclosure.seller.last_name}`,
        email: sd.disclosure.seller.email,
      } : null,
      disclosureStatus: sd.disclosure?.status,
      pdfUrl: sd.disclosure?.pdf_url,
    })),
  });
});

/**
 * @desc    Get a specific shared disclosure details
 * @route   GET /api/buyer/disclosures/:id
 * @access  Private
 */
export const getSharedDisclosure = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  const sharedDisclosure = await SharedDisclosure.findOne({
    where: {
      id,
      [require('sequelize').Op.or]: [
        { recipient_user_id: userId },
        { recipient_email: userEmail },
      ],
    },
    include: [
      {
        model: SellerDisclosure,
        as: 'disclosure',
        include: [
          {
            model: Property,
            as: 'property',
          },
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
          },
        ],
      },
    ],
  });

  if (!sharedDisclosure) {
    res.status(404);
    throw new Error('Shared disclosure not found');
  }

  // Update view tracking
  const now = new Date();
  const updates = {
    view_count: sharedDisclosure.view_count + 1,
    last_viewed_at: now,
  };

  if (!sharedDisclosure.first_viewed_at) {
    updates.first_viewed_at = now;
    updates.status = 'viewed';
  }

  await sharedDisclosure.update(updates);

  // Track the view event
  await analyticsService.trackEvent({
    disclosureId: sharedDisclosure.disclosure_id,
    eventType: 'share_viewed',
    userId: userId,
    metadata: {
      share_id: sharedDisclosure.id,
      view_count: sharedDisclosure.view_count + 1,
      first_view: !sharedDisclosure.first_viewed_at,
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  const disclosure = sharedDisclosure.disclosure;

  res.json({
    success: true,
    sharedDisclosure: {
      id: sharedDisclosure.id,
      status: sharedDisclosure.status,
      sharedAt: sharedDisclosure.created_at,
      message: sharedDisclosure.message,
      viewCount: sharedDisclosure.view_count + 1,
    },
    disclosure: {
      id: disclosure.id,
      status: disclosure.status,
      completionPercentage: disclosure.completion_percentage,
      pdfUrl: disclosure.pdf_url,
      // Section summaries for buyer review
      headerData: disclosure.header_data,
      propertyItems: disclosure.section1_property_items,
      waterSupply: disclosure.section1_water_supply,
      roofInfo: disclosure.section1_roof_info,
      defects: disclosure.section2_defects,
      defectsExplanation: disclosure.section2_explanation,
      conditions: disclosure.section3_conditions,
      conditionsExplanation: disclosure.section3_explanation,
      additionalRepairs: disclosure.section4_additional_repairs,
      additionalRepairsExplanation: disclosure.section4_explanation,
      floodData: disclosure.section5_flood_data,
      floodExplanation: disclosure.section5_explanation,
      floodClaim: disclosure.section6_flood_claim,
      floodClaimExplanation: disclosure.section6_explanation,
      femaAssistance: disclosure.section7_fema_assistance,
      femaExplanation: disclosure.section7_explanation,
      legalConditions: disclosure.section8_conditions,
      hoaDetails: disclosure.section8_hoa_details,
      commonAreas: disclosure.section8_common_areas,
      legalExplanation: disclosure.section8_explanation,
      hasInspectionReports: disclosure.section9_has_reports,
      inspectionReports: disclosure.section9_reports,
      taxExemptions: disclosure.section10_exemptions,
      insuranceClaims: disclosure.section11_insurance_claims,
      unremediatedClaims: disclosure.section12_unremediated_claims,
      unremediatedExplanation: disclosure.section12_explanation,
      smokeDetectors: disclosure.section13_smoke_detectors,
      smokeDetectorsExplanation: disclosure.section13_explanation,
      utilityProviders: disclosure.utility_providers,
      attachments: disclosure.attachments,
      sellerSignature: disclosure.seller1_signature,
    },
    property: disclosure.property ? {
      id: disclosure.property.id,
      address: disclosure.property.address,
      city: disclosure.property.city,
      state: disclosure.property.state,
      zipCode: disclosure.property.zip_code,
      price: disclosure.property.price,
      bedrooms: disclosure.property.bedrooms,
      bathrooms: disclosure.property.bathrooms,
      squareFeet: disclosure.property.square_feet,
      yearBuilt: disclosure.property.year_built,
      images: disclosure.property.images,
    } : null,
    seller: disclosure.seller ? {
      name: `${disclosure.seller.first_name} ${disclosure.seller.last_name}`,
      email: disclosure.seller.email,
      phone: disclosure.seller.phone,
    } : null,
  });
});

/**
 * @desc    Acknowledge receipt of disclosure (buyer)
 * @route   POST /api/buyer/disclosures/:id/acknowledge
 * @access  Private
 */
export const acknowledgeDisclosure = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  const sharedDisclosure = await SharedDisclosure.findOne({
    where: {
      id,
      [require('sequelize').Op.or]: [
        { recipient_user_id: userId },
        { recipient_email: userEmail },
      ],
    },
  });

  if (!sharedDisclosure) {
    res.status(404);
    throw new Error('Shared disclosure not found');
  }

  if (sharedDisclosure.status === 'acknowledged' || sharedDisclosure.status === 'signed') {
    res.status(400);
    throw new Error('Disclosure has already been acknowledged');
  }

  await sharedDisclosure.update({
    status: 'acknowledged',
    acknowledged_at: new Date(),
  });

  // Track the acknowledge event
  await analyticsService.trackEvent({
    disclosureId: sharedDisclosure.disclosure_id,
    eventType: 'share_acknowledged',
    userId: userId,
    metadata: {
      share_id: sharedDisclosure.id,
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Disclosure acknowledged successfully',
    acknowledgedAt: sharedDisclosure.acknowledged_at,
  });
});

/**
 * @desc    Sign disclosure (buyer acknowledgment signature)
 * @route   POST /api/buyer/disclosures/:id/sign
 * @access  Private
 */
export const signDisclosure = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { signatureData, printedName } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;

  if (!signatureData || !printedName) {
    res.status(400);
    throw new Error('Signature data and printed name are required');
  }

  const sharedDisclosure = await SharedDisclosure.findOne({
    where: {
      id,
      [require('sequelize').Op.or]: [
        { recipient_user_id: userId },
        { recipient_email: userEmail },
      ],
    },
    include: [{
      model: SellerDisclosure,
      as: 'disclosure',
    }],
  });

  if (!sharedDisclosure) {
    res.status(404);
    throw new Error('Shared disclosure not found');
  }

  if (sharedDisclosure.status === 'signed') {
    res.status(400);
    throw new Error('Disclosure has already been signed');
  }

  const now = new Date();

  // Update shared disclosure status
  await sharedDisclosure.update({
    status: 'signed',
    signed_at: now,
  });

  // Update the actual disclosure with buyer signature
  const disclosure = sharedDisclosure.disclosure;
  const buyerSignature = {
    signature_data: signatureData,
    name: printedName,
    date: now.toISOString(),
    user_id: userId,
    email: userEmail,
  };

  // Add to buyer1 or buyer2 signature slot
  if (!disclosure.buyer1_signature) {
    await disclosure.update({ buyer1_signature: buyerSignature });
  } else if (!disclosure.buyer2_signature) {
    await disclosure.update({ buyer2_signature: buyerSignature });
  }

  // Track the sign event
  await analyticsService.trackEvent({
    disclosureId: sharedDisclosure.disclosure_id,
    eventType: 'share_signed',
    userId: userId,
    metadata: {
      share_id: sharedDisclosure.id,
      printed_name: printedName,
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Disclosure signed successfully',
    signedAt: now,
  });
});

/**
 * @desc    View disclosure via public access token (for non-logged-in users)
 * @route   GET /api/buyer/disclosures/view/:token
 * @access  Public
 */
export const viewDisclosureByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const sharedDisclosure = await SharedDisclosure.findOne({
    where: { access_token: token },
    include: [
      {
        model: SellerDisclosure,
        as: 'disclosure',
        include: [
          {
            model: Property,
            as: 'property',
          },
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'first_name', 'last_name'],
          },
        ],
      },
    ],
  });

  if (!sharedDisclosure) {
    res.status(404);
    throw new Error('Disclosure not found or link has expired');
  }

  // Check expiration
  if (sharedDisclosure.expires_at && new Date() > sharedDisclosure.expires_at) {
    res.status(410);
    throw new Error('This disclosure link has expired');
  }

  // Update view tracking
  const now = new Date();
  const updates = {
    view_count: sharedDisclosure.view_count + 1,
    last_viewed_at: now,
  };

  if (!sharedDisclosure.first_viewed_at) {
    updates.first_viewed_at = now;
    updates.status = 'viewed';
  }

  await sharedDisclosure.update(updates);

  // Track the public view event
  await analyticsService.trackEvent({
    disclosureId: sharedDisclosure.disclosure_id,
    eventType: 'share_viewed',
    userId: null, // Public access, no user
    metadata: {
      share_id: sharedDisclosure.id,
      view_count: sharedDisclosure.view_count + 1,
      first_view: !sharedDisclosure.first_viewed_at,
      public_access: true,
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  const disclosure = sharedDisclosure.disclosure;

  res.json({
    success: true,
    requiresAuth: false,
    disclosure: {
      id: disclosure.id,
      pdfUrl: disclosure.pdf_url,
      status: disclosure.status,
      headerData: disclosure.header_data,
    },
    property: disclosure.property ? {
      address: disclosure.property.address,
      city: disclosure.property.city,
      state: disclosure.property.state,
    } : null,
    seller: disclosure.seller ? {
      name: `${disclosure.seller.first_name} ${disclosure.seller.last_name}`,
    } : null,
  });
});

/**
 * @desc    Get buyer dashboard stats
 * @route   GET /api/buyer/dashboard/stats
 * @access  Private
 */
export const getBuyerDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  const { Op } = require('sequelize');

  const [total, pending, viewed, acknowledged, signed] = await Promise.all([
    SharedDisclosure.count({
      where: {
        [Op.or]: [
          { recipient_user_id: userId },
          { recipient_email: userEmail },
        ],
      },
    }),
    SharedDisclosure.count({
      where: {
        [Op.or]: [
          { recipient_user_id: userId },
          { recipient_email: userEmail },
        ],
        status: 'pending',
      },
    }),
    SharedDisclosure.count({
      where: {
        [Op.or]: [
          { recipient_user_id: userId },
          { recipient_email: userEmail },
        ],
        status: 'viewed',
      },
    }),
    SharedDisclosure.count({
      where: {
        [Op.or]: [
          { recipient_user_id: userId },
          { recipient_email: userEmail },
        ],
        status: 'acknowledged',
      },
    }),
    SharedDisclosure.count({
      where: {
        [Op.or]: [
          { recipient_user_id: userId },
          { recipient_email: userEmail },
        ],
        status: 'signed',
      },
    }),
  ]);

  res.json({
    success: true,
    stats: {
      total,
      pending,
      viewed,
      acknowledged,
      signed,
      needsAction: pending + viewed,
    },
  });
});
