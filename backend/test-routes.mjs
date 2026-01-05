// Test script to verify route imports and wiring
import express from 'express';

console.log('=== Testing Route Imports ===\n');

const routes = [
  { name: 'auth', path: './routes/auth.js' },
  { name: 'properties', path: './routes/properties.js' },
  { name: 'disclosures', path: './routes/disclosures.js' },
  { name: 'buyer', path: './routes/buyer.js' },
  { name: 'analytics', path: './routes/analytics.js' },
  { name: 'uploads', path: './routes/uploads.js' },
];

const results = [];

for (const route of routes) {
  try {
    const module = await import(route.path);
    const router = module.default;

    // Get the routes from the router
    const routeStack = router.stack || [];
    const endpoints = routeStack
      .filter(layer => layer.route)
      .map(layer => {
        const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
        return `${methods} ${layer.route.path}`;
      });

    console.log(`✅ ${route.name}: ${endpoints.length} endpoints`);
    endpoints.forEach(ep => console.log(`   - ${ep}`));
    results.push({ name: route.name, success: true, count: endpoints.length });
  } catch (err) {
    console.log(`❌ ${route.name}: ${err.message}`);
    results.push({ name: route.name, success: false, error: err.message });
  }
  console.log('');
}

console.log('=== Summary ===');
const successful = results.filter(r => r.success).length;
const failed = results.filter(r => !r.success).length;
console.log(`✅ Successful: ${successful}`);
console.log(`❌ Failed: ${failed}`);

if (failed > 0) {
  console.log('\nFailed routes need attention:');
  results.filter(r => !r.success).forEach(r => {
    console.log(`  - ${r.name}: ${r.error}`);
  });
}
