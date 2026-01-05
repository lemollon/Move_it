// Test script to verify controller exports
console.log('=== Testing Controller Imports ===\n');

const controllers = [
  {
    name: 'disclosureController',
    path: './controllers/disclosureController.js',
    expected: ['getDisclosure', 'createOrGetDisclosure', 'autoSaveSection', 'updateDisclosure',
               'validateDisclosure', 'completeDisclosure', 'signDisclosureSeller', 'signDisclosureBuyer',
               'getSellerDisclosures', 'addAttachment', 'removeAttachment', 'generatePDF', 'shareDisclosure',
               'getFSBOChecklist', 'createFSBOChecklist', 'autoSaveFSBOCategory', 'updateFSBOChecklist', 'deleteFSBOChecklist']
  },
  {
    name: 'buyerController',
    path: './controllers/buyerController.js',
    expected: ['getBuyerDisclosures', 'getSharedDisclosure', 'acknowledgeDisclosure', 'signDisclosure',
               'viewDisclosureByToken', 'getBuyerDashboardStats']
  },
  {
    name: 'authController',
    path: './controllers/authController.js',
    expected: ['register', 'login', 'getMe', 'logout', 'updateProfile', 'updatePassword', 'forgotPassword', 'resetPassword']
  }
];

let totalIssues = 0;

for (const ctrl of controllers) {
  try {
    const module = await import(ctrl.path);
    const exported = Object.keys(module);

    console.log(`✅ ${ctrl.name}: ${exported.length} exports`);

    // Check for missing expected exports
    const missing = ctrl.expected.filter(e => !exported.includes(e));
    if (missing.length > 0) {
      console.log(`   ⚠️  Missing: ${missing.join(', ')}`);
      totalIssues += missing.length;
    }

    // Show what's actually exported
    console.log(`   Exports: ${exported.join(', ')}`);
  } catch (err) {
    console.log(`❌ ${ctrl.name}: ${err.message}`);
    totalIssues++;
  }
  console.log('');
}

console.log('=== Services Check ===\n');

const services = [
  { name: 'emailService', path: './services/emailService.js', expected: ['emailService'] },
  { name: 'pdfService', path: './services/pdfService.js', expected: ['pdfService', 'generateDisclosurePDF', 'generateFSBOChecklistPDF'] },
  { name: 'analyticsService', path: './services/analyticsService.js', expected: ['analyticsService'] },
  { name: 'smsService', path: './services/smsService.js', expected: ['smsService'] },
  { name: 'cloudinaryService', path: './services/cloudinaryService.js', expected: ['cloudinaryService'] },
];

for (const svc of services) {
  try {
    const module = await import(svc.path);
    const exported = Object.keys(module);

    const missing = svc.expected.filter(e => !exported.includes(e));
    if (missing.length > 0) {
      console.log(`⚠️  ${svc.name}: Missing ${missing.join(', ')}`);
      totalIssues++;
    } else {
      console.log(`✅ ${svc.name}: OK`);
    }
  } catch (err) {
    console.log(`❌ ${svc.name}: ${err.message}`);
    totalIssues++;
  }
}

console.log('\n=== Summary ===');
if (totalIssues === 0) {
  console.log('✅ All controllers and services verified successfully!');
} else {
  console.log(`⚠️  Found ${totalIssues} issues to address`);
}
