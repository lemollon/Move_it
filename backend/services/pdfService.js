import PDFDocument from 'pdfkit';
import { cloudinaryService } from './cloudinaryService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF for Seller's Disclosure (TXR-1406 format)
 */
export const generateDisclosurePDF = async (disclosure, property, seller) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: "Seller's Disclosure Notice",
          Author: 'Move-it',
          Subject: `Property: ${property?.address || 'N/A'}`,
        },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);

        // Upload to Cloudinary or save locally
        try {
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            const result = await cloudinaryService.uploadDocument(pdfBuffer, {
              folder: `move-it/disclosures/${disclosure.id}`,
              publicId: `disclosure-${disclosure.id}-${Date.now()}`,
            });
            resolve({ url: result.url, publicId: result.publicId });
          } else {
            // Save locally
            const uploadsDir = path.join(__dirname, '../uploads/pdfs');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filename = `disclosure-${disclosure.id}-${Date.now()}.pdf`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, pdfBuffer);
            resolve({ url: `/uploads/pdfs/${filename}`, publicId: null });
          }
        } catch (uploadError) {
          reject(uploadError);
        }
      });

      // === PDF CONTENT ===

      // Header
      doc.fontSize(16).font('Helvetica-Bold')
        .text("SELLER'S DISCLOSURE NOTICE", { align: 'center' });
      doc.fontSize(10).font('Helvetica')
        .text('(TXR-1406 Format)', { align: 'center' });
      doc.moveDown(0.5);

      // Property Info
      doc.fontSize(12).font('Helvetica-Bold')
        .text('PROPERTY INFORMATION');
      doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
      doc.moveDown(0.3);

      const headerData = disclosure.header_data || {};
      doc.fontSize(10).font('Helvetica');
      doc.text(`Property Address: ${headerData.property_address || property?.address || 'N/A'}`);
      doc.text(`City: ${headerData.city || property?.city || 'N/A'}, State: ${headerData.state || 'TX'}, Zip: ${headerData.zip || property?.zip_code || 'N/A'}`);
      doc.text(`Seller Name(s): ${headerData.seller_names || `${seller?.first_name || ''} ${seller?.last_name || ''}`}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Section 1: Property Items
      addSection(doc, '1. ITEMS INCLUDED WITH THE PROPERTY', () => {
        const items = disclosure.section1_property_items || {};
        doc.text('The following items are included with the property unless otherwise specified:', { continued: false });
        doc.moveDown(0.3);

        const itemsList = [
          'Range/Stove', 'Oven', 'Microwave', 'Dishwasher', 'Trash Compactor',
          'Garbage Disposal', 'Washer', 'Dryer', 'Ceiling Fan(s)', 'Attic Fan',
          'Window Screens', 'Rain Gutters', 'Garage Door Opener(s)', 'Security System',
          'Fire Detection System', 'TV Antenna/Satellite Dish', 'Pool/Spa/Hot Tub',
          'Pool Equipment', 'Pool Heater', 'Automatic Pool Cleaner', 'Water Heater',
          'Water Softener', 'Outdoor Grill', 'Outdoor Lighting', 'Water Sprinkler System',
        ];

        const includedItems = itemsList.filter(item => {
          const key = item.toLowerCase().replace(/[^a-z]/g, '_');
          return items[key] === true || items[key] === 'yes';
        });

        if (includedItems.length > 0) {
          doc.text(`Included: ${includedItems.join(', ')}`);
        } else {
          doc.text('Items: See original disclosure form for complete list');
        }
      });

      // Section 2: Defects
      addSection(doc, '2. DEFECTS OR MALFUNCTIONS', () => {
        const defects = disclosure.section2_defects || {};
        const hasDefects = Object.values(defects).some(v => v === true || v === 'yes');
        doc.text(`Are you aware of any defects or malfunctions? ${hasDefects ? 'YES' : 'NO'}`);
        if (disclosure.section2_explanation) {
          doc.moveDown(0.3);
          doc.text(`Explanation: ${disclosure.section2_explanation}`);
        }
      });

      // Section 3: Conditions
      addSection(doc, '3. AWARENESS OF CONDITIONS', () => {
        const conditions = disclosure.section3_conditions || {};
        const conditionsList = [
          'Present or previous termite/wood-destroying insect activity',
          'Termite/wood-destroying insect damage needing repair',
          'Previous termite/wood-destroying insect treatment',
          'Previous flooding or water damage',
          'Located in 100-year floodplain',
          'Present or previous foundation problems',
          'Soil movement or settling',
        ];

        doc.text('Seller is aware of the following conditions:');
        conditionsList.forEach((condition, idx) => {
          const key = `condition_${idx + 1}`;
          const value = conditions[key];
          if (value === true || value === 'yes') {
            doc.text(`  - ${condition}: YES`);
          }
        });

        if (disclosure.section3_explanation) {
          doc.moveDown(0.3);
          doc.text(`Explanation: ${disclosure.section3_explanation}`);
        }
      });

      // Section 4: Additional Repairs
      addSection(doc, '4. ADDITIONAL REPAIR NEEDS', () => {
        doc.text(`Additional repairs known: ${disclosure.section4_additional_repairs ? 'YES' : 'NO'}`);
        if (disclosure.section4_explanation) {
          doc.moveDown(0.3);
          doc.text(`Details: ${disclosure.section4_explanation}`);
        }
      });

      // Section 5-7: Flood Information
      addSection(doc, '5-7. FLOOD-RELATED INFORMATION', () => {
        const floodData = disclosure.section5_flood_data || {};
        doc.text(`Property located in floodplain: ${floodData.in_floodplain || 'Unknown'}`);
        doc.text(`Flood insurance claims filed: ${disclosure.section6_flood_claim ? 'YES' : 'NO'}`);
        doc.text(`FEMA/SBA assistance received: ${disclosure.section7_fema_assistance ? 'YES' : 'NO'}`);
      });

      // Section 8: Legal/HOA
      addSection(doc, '8. LEGAL AND HOA INFORMATION', () => {
        const hoaDetails = disclosure.section8_hoa_details || {};
        doc.text(`Property subject to HOA: ${hoaDetails.has_hoa ? 'YES' : 'NO'}`);
        if (hoaDetails.has_hoa) {
          doc.text(`HOA Name: ${hoaDetails.hoa_name || 'N/A'}`);
          doc.text(`Monthly Dues: ${hoaDetails.monthly_dues ? `$${hoaDetails.monthly_dues}` : 'N/A'}`);
        }
      });

      // Section 9-12: Other Information
      addSection(doc, '9-12. ADDITIONAL DISCLOSURES', () => {
        doc.text(`Previous inspection reports available: ${disclosure.section9_has_reports ? 'YES' : 'NO'}`);
        doc.text(`Tax exemptions on property: ${(disclosure.section10_exemptions?.length > 0) ? 'YES' : 'NO'}`);
        doc.text(`Insurance claims (non-flood): ${disclosure.section11_insurance_claims ? 'YES' : 'NO'}`);
        doc.text(`Unremediated claims: ${disclosure.section12_unremediated_claims ? 'YES' : 'NO'}`);
      });

      // Section 13: Smoke Detectors
      addSection(doc, '13. SMOKE DETECTORS', () => {
        doc.text(`Smoke detectors installed: ${disclosure.section13_smoke_detectors?.toUpperCase() || 'UNKNOWN'}`);
      });

      // Utility Providers
      if (disclosure.utility_providers && Object.keys(disclosure.utility_providers).length > 0) {
        addSection(doc, 'UTILITY PROVIDERS', () => {
          const utilities = disclosure.utility_providers;
          if (utilities.electric) doc.text(`Electric: ${utilities.electric}`);
          if (utilities.gas) doc.text(`Gas: ${utilities.gas}`);
          if (utilities.water) doc.text(`Water: ${utilities.water}`);
          if (utilities.sewer) doc.text(`Sewer: ${utilities.sewer}`);
          if (utilities.trash) doc.text(`Trash: ${utilities.trash}`);
        });
      }

      // Signatures Section
      doc.addPage();
      doc.fontSize(12).font('Helvetica-Bold')
        .text('SIGNATURES', { align: 'center' });
      doc.moveDown();

      doc.fontSize(10).font('Helvetica');
      doc.text('The undersigned Seller(s) represent that the information contained in this notice is true and correct to the best of their knowledge as of the date signed.');
      doc.moveDown(2);

      // Seller signatures
      const sig1 = disclosure.seller1_signature;
      const sig2 = disclosure.seller2_signature;

      doc.text('SELLER 1:');
      if (sig1?.name) {
        doc.text(`Name: ${sig1.name}`);
        doc.text(`Date: ${sig1.date || 'N/A'}`);
      } else {
        doc.text('_________________________________');
        doc.text('Signature                    Date');
      }
      doc.moveDown();

      doc.text('SELLER 2 (if applicable):');
      if (sig2?.name) {
        doc.text(`Name: ${sig2.name}`);
        doc.text(`Date: ${sig2.date || 'N/A'}`);
      } else {
        doc.text('_________________________________');
        doc.text('Signature                    Date');
      }
      doc.moveDown(2);

      // Buyer acknowledgment
      const buyer1 = disclosure.buyer1_signature;
      const buyer2 = disclosure.buyer2_signature;

      doc.text('BUYER ACKNOWLEDGMENT:');
      doc.text('The undersigned Buyer(s) acknowledge receipt of this Seller\'s Disclosure Notice.');
      doc.moveDown();

      doc.text('BUYER 1:');
      if (buyer1?.name) {
        doc.text(`Name: ${buyer1.name}`);
        doc.text(`Date: ${buyer1.date || 'N/A'}`);
      } else {
        doc.text('_________________________________');
        doc.text('Signature                    Date');
      }
      doc.moveDown();

      doc.text('BUYER 2 (if applicable):');
      if (buyer2?.name) {
        doc.text(`Name: ${buyer2.name}`);
        doc.text(`Date: ${buyer2.date || 'N/A'}`);
      } else {
        doc.text('_________________________________');
        doc.text('Signature                    Date');
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#666666')
        .text(`Generated by Move-it on ${new Date().toLocaleString()}`, { align: 'center' });
      doc.text(`Disclosure ID: ${disclosure.id}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Helper function to add a section to the PDF
 */
function addSection(doc, title, contentFn) {
  // Check if we need a new page
  if (doc.y > 650) {
    doc.addPage();
  }

  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
    .text(title);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica');
  contentFn();
}

/**
 * Generate FSBO Checklist PDF
 */
export const generateFSBOChecklistPDF = async (checklist, property, seller) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);

        try {
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            const result = await cloudinaryService.uploadDocument(pdfBuffer, {
              folder: `move-it/fsbo-checklists/${checklist.id}`,
              publicId: `fsbo-checklist-${checklist.id}-${Date.now()}`,
            });
            resolve({ url: result.url, publicId: result.publicId });
          } else {
            const uploadsDir = path.join(__dirname, '../uploads/pdfs');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filename = `fsbo-checklist-${checklist.id}-${Date.now()}.pdf`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, pdfBuffer);
            resolve({ url: `/uploads/pdfs/${filename}`, publicId: null });
          }
        } catch (uploadError) {
          reject(uploadError);
        }
      });

      // Header
      doc.fontSize(18).font('Helvetica-Bold')
        .text('FOR SALE BY OWNER CHECKLIST', { align: 'center' });
      doc.moveDown();

      doc.fontSize(10).font('Helvetica')
        .text(`Property: ${property?.address || 'N/A'}`);
      doc.text(`Seller: ${seller?.first_name || ''} ${seller?.last_name || ''}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Progress
      const completedCount = Object.values(checklist.items || {})
        .filter(item => item?.completed).length;
      const totalItems = Object.keys(checklist.items || {}).length || 1;
      const progress = Math.round((completedCount / totalItems) * 100);

      doc.fontSize(12).font('Helvetica-Bold')
        .text(`Progress: ${progress}% Complete (${completedCount}/${totalItems} items)`);
      doc.moveDown();

      // Checklist items by category
      const categories = {
        'Pre-Listing': ['research_market', 'determine_price', 'prepare_home', 'take_photos'],
        'Legal Documents': ['sellers_disclosure', 'lead_paint', 'hoa_docs', 'survey'],
        'Marketing': ['create_listing', 'yard_sign', 'schedule_showings', 'virtual_tour'],
        'Showing & Offers': ['showing_checklist', 'review_offers', 'negotiate_terms'],
        'Contract & Closing': ['earnest_money', 'title_company', 'inspections', 'appraisal', 'final_walkthrough', 'closing_docs'],
      };

      const items = checklist.items || {};

      Object.entries(categories).forEach(([category, itemKeys]) => {
        doc.fontSize(11).font('Helvetica-Bold').text(category);
        doc.moveTo(50, doc.y).lineTo(300, doc.y).stroke();
        doc.moveDown(0.3);

        itemKeys.forEach(key => {
          const item = items[key] || {};
          const status = item.completed ? '[x]' : '[ ]';
          doc.fontSize(10).font('Helvetica')
            .text(`${status} ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
          if (item.notes) {
            doc.fontSize(9).fillColor('#666666')
              .text(`    Notes: ${item.notes}`);
            doc.fillColor('#000000');
          }
        });
        doc.moveDown();
      });

      // Footer
      doc.fontSize(8).fillColor('#666666')
        .text(`Generated by Move-it on ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const pdfService = {
  generateDisclosurePDF,
  generateFSBOChecklistPDF,
};

export default pdfService;
