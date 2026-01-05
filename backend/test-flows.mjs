// Test script to verify end-to-end flow wiring
console.log('=== Testing End-to-End Flow Wiring ===\n');

// Import all necessary modules
import { shareDisclosure } from './controllers/disclosureController.js';
import { getBuyerDisclosures, getSharedDisclosure, acknowledgeDisclosure, signDisclosure } from './controllers/buyerController.js';
import { analyticsService } from './services/analyticsService.js';
import { smsService } from './services/smsService.js';
import { emailService } from './services/emailService.js';
import { pdfService } from './services/pdfService.js';
import { SharedDisclosure, SellerDisclosure, DisclosureAnalytics } from './models/index.js';

let issues = [];

// Test 1: Verify shareDisclosure imports SharedDisclosure model
console.log('1️⃣ Testing Disclosure Sharing Flow...');
try {
  // Verify the controller function exists and is callable
  if (typeof shareDisclosure !== 'function') {
    issues.push('shareDisclosure is not a function');
  } else {
    console.log('   ✅ shareDisclosure function exists');
  }

  // Verify SharedDisclosure model has required fields
  const requiredFields = ['disclosure_id', 'recipient_email', 'shared_by', 'access_token', 'status'];
  const modelFields = Object.keys(SharedDisclosure.rawAttributes);
  const missingFields = requiredFields.filter(f => !modelFields.includes(f));
  if (missingFields.length > 0) {
    issues.push(`SharedDisclosure missing fields: ${missingFields.join(', ')}`);
  } else {
    console.log('   ✅ SharedDisclosure model has all required fields');
  }

  // Verify email service has sendDisclosureShared method
  if (typeof emailService.sendDisclosureShared !== 'function') {
    issues.push('emailService.sendDisclosureShared is not a function');
  } else {
    console.log('   ✅ emailService.sendDisclosureShared exists');
  }
} catch (err) {
  issues.push(`Sharing flow error: ${err.message}`);
}

// Test 2: Verify Buyer Dashboard Flow
console.log('\n2️⃣ Testing Buyer Dashboard Flow...');
try {
  const buyerFunctions = [
    { name: 'getBuyerDisclosures', fn: getBuyerDisclosures },
    { name: 'getSharedDisclosure', fn: getSharedDisclosure },
    { name: 'acknowledgeDisclosure', fn: acknowledgeDisclosure },
    { name: 'signDisclosure', fn: signDisclosure },
  ];

  for (const { name, fn } of buyerFunctions) {
    if (typeof fn !== 'function') {
      issues.push(`${name} is not a function`);
    } else {
      console.log(`   ✅ ${name} function exists`);
    }
  }

  // Check SharedDisclosure associations
  const associations = Object.keys(SharedDisclosure.associations || {});
  const requiredAssocs = ['disclosure', 'sharer', 'recipient'];
  const missingAssocs = requiredAssocs.filter(a => !associations.includes(a));
  if (missingAssocs.length > 0) {
    issues.push(`SharedDisclosure missing associations: ${missingAssocs.join(', ')}`);
  } else {
    console.log('   ✅ SharedDisclosure has required associations');
  }
} catch (err) {
  issues.push(`Buyer dashboard flow error: ${err.message}`);
}

// Test 3: Verify Analytics Tracking
console.log('\n3️⃣ Testing Analytics Tracking...');
try {
  const analyticsMethods = ['trackEvent', 'getDisclosureSummary', 'getSellerAnalytics', 'getDisclosureTimeline'];
  for (const method of analyticsMethods) {
    if (typeof analyticsService[method] !== 'function') {
      issues.push(`analyticsService.${method} is not a function`);
    } else {
      console.log(`   ✅ analyticsService.${method} exists`);
    }
  }

  // Verify DisclosureAnalytics model
  const eventTypes = DisclosureAnalytics.rawAttributes.event_type?.values || [];
  const requiredEvents = ['created', 'viewed', 'shared', 'signed_buyer', 'signed_seller'];
  const missingEvents = requiredEvents.filter(e => !eventTypes.includes(e));
  if (missingEvents.length > 0) {
    issues.push(`DisclosureAnalytics missing event types: ${missingEvents.join(', ')}`);
  } else {
    console.log('   ✅ DisclosureAnalytics has required event types');
  }
} catch (err) {
  issues.push(`Analytics flow error: ${err.message}`);
}

// Test 4: Verify SMS Service
console.log('\n4️⃣ Testing SMS Service...');
try {
  const smsMethods = ['send', 'sendDisclosureShared', 'sendDisclosureViewed',
                     'sendDisclosureAcknowledged', 'sendDisclosureSigned',
                     'sendNewOfferNotification', 'sendOfferStatusUpdate'];
  for (const method of smsMethods) {
    if (typeof smsService[method] !== 'function') {
      issues.push(`smsService.${method} is not a function`);
    } else {
      console.log(`   ✅ smsService.${method} exists`);
    }
  }

  // Test mock SMS (should return success when not configured)
  const mockResult = await smsService.send('+15555555555', 'Test message');
  if (!mockResult.success) {
    issues.push('SMS mock mode not working correctly');
  } else {
    console.log('   ✅ SMS mock mode working');
  }
} catch (err) {
  issues.push(`SMS flow error: ${err.message}`);
}

// Test 5: Verify PDF Service
console.log('\n5️⃣ Testing PDF Service...');
try {
  const pdfMethods = ['generateDisclosurePDF', 'generateFSBOChecklistPDF'];
  for (const method of pdfMethods) {
    if (typeof pdfService[method] !== 'function') {
      issues.push(`pdfService.${method} is not a function`);
    } else {
      console.log(`   ✅ pdfService.${method} exists`);
    }
  }
} catch (err) {
  issues.push(`PDF flow error: ${err.message}`);
}

// Test 6: Verify SellerDisclosure -> SharedDisclosure relationship
console.log('\n6️⃣ Testing Model Relationships...');
try {
  // SellerDisclosure should have hasMany SharedDisclosure
  if (!SellerDisclosure.associations.shares) {
    issues.push('SellerDisclosure does not have shares association');
  } else {
    console.log('   ✅ SellerDisclosure.shares association exists');
  }

  // SellerDisclosure should have hasMany DisclosureAnalytics
  if (!SellerDisclosure.associations.analytics) {
    issues.push('SellerDisclosure does not have analytics association');
  } else {
    console.log('   ✅ SellerDisclosure.analytics association exists');
  }
} catch (err) {
  issues.push(`Model relationship error: ${err.message}`);
}

// Summary
console.log('\n========================================');
console.log('=== FLOW VERIFICATION SUMMARY ===');
console.log('========================================');

if (issues.length === 0) {
  console.log('\n✅ All flow verifications PASSED!');
  console.log('\nThe following flows are properly wired:');
  console.log('  • Disclosure Sharing Flow');
  console.log('  • Buyer Dashboard Flow');
  console.log('  • Analytics Tracking');
  console.log('  • SMS Notifications');
  console.log('  • PDF Generation');
  console.log('  • Model Relationships');
} else {
  console.log(`\n❌ Found ${issues.length} issues:\n`);
  issues.forEach((issue, idx) => {
    console.log(`   ${idx + 1}. ${issue}`);
  });
}

console.log('\n');
