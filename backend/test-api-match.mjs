// Test script to verify frontend API methods match backend routes
console.log('=== Verifying Frontend API -> Backend Route Matching ===\n');

// Define expected API <-> Route mappings
const mappings = [
  // Auth API
  { frontend: 'authAPI.login', backend: 'POST /api/auth/login' },
  { frontend: 'authAPI.register', backend: 'POST /api/auth/register' },
  { frontend: 'authAPI.getMe', backend: 'GET /api/auth/me' },
  { frontend: 'authAPI.forgotPassword', backend: 'POST /api/auth/forgotpassword' },
  { frontend: 'authAPI.resetPassword', backend: 'POST /api/auth/resetpassword' },

  // Disclosures API
  { frontend: 'disclosuresAPI.getByProperty', backend: 'GET /api/disclosures/property/:propertyId' },
  { frontend: 'disclosuresAPI.createOrGet', backend: 'POST /api/disclosures/property/:propertyId' },
  { frontend: 'disclosuresAPI.autoSaveSection', backend: 'PATCH /api/disclosures/:id/section/:sectionNumber' },
  { frontend: 'disclosuresAPI.update', backend: 'PUT /api/disclosures/:id' },
  { frontend: 'disclosuresAPI.validate', backend: 'POST /api/disclosures/:id/validate' },
  { frontend: 'disclosuresAPI.complete', backend: 'POST /api/disclosures/:id/complete' },
  { frontend: 'disclosuresAPI.signSeller', backend: 'POST /api/disclosures/:id/sign/seller' },
  { frontend: 'disclosuresAPI.signBuyer', backend: 'POST /api/disclosures/:id/sign/buyer' },
  { frontend: 'disclosuresAPI.getSellerDisclosures', backend: 'GET /api/disclosures/seller' },
  { frontend: 'disclosuresAPI.addAttachment', backend: 'POST /api/disclosures/:id/attachments' },
  { frontend: 'disclosuresAPI.removeAttachment', backend: 'DELETE /api/disclosures/:id/attachments/:attachmentId' },
  { frontend: 'disclosuresAPI.generatePDF', backend: 'POST /api/disclosures/:id/generate-pdf' },
  { frontend: 'disclosuresAPI.getPDF', backend: 'GET /api/disclosures/:id/pdf' },
  { frontend: 'disclosuresAPI.shareDisclosure', backend: 'POST /api/disclosures/:id/share' },
  { frontend: 'disclosuresAPI.getFSBOChecklist', backend: 'GET /api/disclosures/fsbo-checklist' },
  { frontend: 'disclosuresAPI.createFSBOChecklist', backend: 'POST /api/disclosures/fsbo-checklist/property/:propertyId' },
  { frontend: 'disclosuresAPI.autoSaveFSBOCategory', backend: 'PATCH /api/disclosures/fsbo-checklist/:id/category/:category' },
  { frontend: 'disclosuresAPI.updateFSBOChecklist', backend: 'PUT /api/disclosures/fsbo-checklist/:id' },
  { frontend: 'disclosuresAPI.deleteFSBOChecklist', backend: 'DELETE /api/disclosures/fsbo-checklist/:id' },

  // Buyer API
  { frontend: 'buyerAPI.getDashboardStats', backend: 'GET /api/buyer/dashboard/stats' },
  { frontend: 'buyerAPI.getDisclosures', backend: 'GET /api/buyer/disclosures' },
  { frontend: 'buyerAPI.getDisclosure', backend: 'GET /api/buyer/disclosures/:id' },
  { frontend: 'buyerAPI.acknowledgeDisclosure', backend: 'POST /api/buyer/disclosures/:id/acknowledge' },
  { frontend: 'buyerAPI.signDisclosure', backend: 'POST /api/buyer/disclosures/:id/sign' },
  { frontend: 'buyerAPI.viewByToken', backend: 'GET /api/buyer/disclosures/view/:token' },
];

// Import routes to verify they exist
import authRoutes from './routes/auth.js';
import disclosuresRoutes from './routes/disclosures.js';
import buyerRoutes from './routes/buyer.js';

const routeStacks = {
  auth: authRoutes.stack,
  disclosures: disclosuresRoutes.stack,
  buyer: buyerRoutes.stack,
};

function getRoutes(router) {
  return router
    .filter(layer => layer.route)
    .map(layer => {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      return `${methods} ${layer.route.path}`;
    });
}

const allRoutes = {
  auth: getRoutes(routeStacks.auth),
  disclosures: getRoutes(routeStacks.disclosures),
  buyer: getRoutes(routeStacks.buyer),
};

console.log('Backend Routes Available:');
console.log('  Auth:', allRoutes.auth.length);
console.log('  Disclosures:', allRoutes.disclosures.length);
console.log('  Buyer:', allRoutes.buyer.length);
console.log('');

// Check each mapping
let passed = 0;
let failed = 0;
const issues = [];

console.log('Checking API -> Route Mappings:\n');

for (const mapping of mappings) {
  const { frontend, backend } = mapping;

  // Parse the backend route
  const [method, path] = backend.split(' ');
  const pathParts = path.split('/').filter(Boolean);
  const routePrefix = pathParts[1]; // 'auth', 'disclosures', or 'buyer'
  const routePath = '/' + pathParts.slice(2).join('/');

  // Check if route exists
  const routeList = allRoutes[routePrefix] || [];
  const matchingRoute = routeList.find(r => {
    const [rMethod, rPath] = r.split(' ');
    // Normalize paths for comparison
    const normalizedBackend = routePath.replace(/:[^/]+/g, ':param');
    const normalizedRoute = rPath.replace(/:[^/]+/g, ':param');
    return rMethod === method && normalizedBackend === normalizedRoute;
  });

  if (matchingRoute) {
    console.log(`   ✅ ${frontend} -> ${backend}`);
    passed++;
  } else {
    console.log(`   ❌ ${frontend} -> ${backend} (NOT FOUND)`);
    issues.push(`${frontend}: Route ${backend} not found`);
    failed++;
  }
}

console.log('\n========================================');
console.log('=== API MATCHING SUMMARY ===');
console.log('========================================');
console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed > 0) {
  console.log('\nIssues found:');
  issues.forEach(issue => console.log(`   - ${issue}`));
} else {
  console.log('\n✅ All frontend API methods match backend routes!');
}

console.log('\n');
