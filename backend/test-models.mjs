// Test script to verify model exports and associations
import * as models from './models/index.js';

console.log('=== Models Exported ===');
const exportedModels = Object.keys(models).filter(k => k !== 'default' && k !== 'syncDatabase' && k !== 'sequelize');
console.log(exportedModels.join(', '));

console.log('\n=== Model Associations ===');
const modelNames = ['User', 'Property', 'SellerDisclosure', 'SharedDisclosure', 'DisclosureAnalytics', 'FSBOChecklist'];
modelNames.forEach(name => {
  if (models[name]) {
    const assocs = Object.keys(models[name].associations || {});
    console.log(`${name}: ${assocs.length > 0 ? assocs.join(', ') : 'No associations'}`);
  } else {
    console.log(`${name}: NOT FOUND`);
  }
});

console.log('\n=== Checking SharedDisclosure Model ===');
if (models.SharedDisclosure) {
  console.log('SharedDisclosure fields:', Object.keys(models.SharedDisclosure.rawAttributes).join(', '));
}

console.log('\n=== Checking DisclosureAnalytics Model ===');
if (models.DisclosureAnalytics) {
  console.log('DisclosureAnalytics fields:', Object.keys(models.DisclosureAnalytics.rawAttributes).join(', '));
}

console.log('\n✅ Model verification complete');
