# Seller's Disclosure Notice - Implementation Guide

## Overview

Texas Property Code Section 5.008 requires sellers of residential property to deliver a Seller's Disclosure Notice to buyers. This document outlines how Move-it implements this legal requirement.

**Form:** TXR-1406 (Texas Association of REALTORS®)
**Pages:** 7
**Sections:** 13

## Critical Legal Requirements

### ⚠️ Must-Haves:
1. **Attorney Review:** All final disclosures must be reviewed by licensed Texas attorneys
2. **No AI Generation:** AI collects information; attorneys create legal documents
3. **Signature Required:** Both buyer and seller must sign
4. **Delivery Timing:** Must be delivered on or before effective date of contract
5. **PDF Generation:** Final signed disclosure must be preserved as PDF

### Auto-Detection Rules

The platform automatically detects and requires additional disclosures based on:

| Condition | Triggers | Required Form |
|-----------|----------|---------------|
| Built before 1978 | Year built < 1978 | TXR-1906 (Lead-Based Paint) |
| Septic system | Has septic/on-site sewer | TXR-1407 (On-Site Sewer Facility) |
| In MUD district | MUD data present | MUD notice in disclosure |
| In flood zone | FEMA flood zone data | Additional flood disclosures |
| HOA present | HOA info in listing | HOA disclosure |

## 13 Sections Breakdown

### Section 1: Property Items (Y/N/U checkboxes)

**91 items** covering everything from appliances to utilities.

**Implementation:**
- JSONB field in database for flexibility
- Grouped UI: Appliances, Systems, Outdoor, Safety
- Additional information text fields for details
- Auto-populate from listing data where possible

**Special Items:**
- Central A/C: Capture electric/gas, number of units
- Garage: Attached/not attached, opener count, remotes
- Security System: Owned vs leased (capture company name)
- Solar Panels: Owned vs leased (capture company name)

**Database Structure:**
```json
{
  "ceiling_fans": "yes",
  "dishwasher": "yes",
  "central_ac": {
    "present": "yes",
    "type": "electric",
    "units": 2
  },
  "security_system": {
    "present": "yes",
    "owned_or_leased": "leased",
    "company": "ADT Security"
  }
}
```

### Section 2: Defects/Malfunctions (Y/N for awareness)

**18 items** about structural and system defects.

Categories:
- Structural: Basement, ceilings, doors, driveways, walls, windows
- Systems: Electrical, plumbing, roof
- Components: Floors, foundation/slabs, lighting fixtures

**Required if "Yes":** Detailed explanation in text field

**UI Pattern:**
```jsx
<DefectCheckbox label="Foundation / Slab(s)" />
{hasDefect && <TextArea placeholder="Explain the defect..." />}
```

### Section 3: Conditions (Y/N for awareness)

**33 conditions** ranging from hazards to legal issues.

**Critical Items:**
- Aluminum wiring
- Asbestos components
- Lead-based paint (triggers TXR-1906)
- Previous fires
- Active termite infestation
- Wetlands on property
- Encroachments
- Historic designation

**Implementation Note:**
If seller answers "Yes" to lead-based paint AND property built before 1978, automatically attach TXR-1906 form requirement.

### Section 4: Additional Repairs Needed

Simple yes/no question: "Any item, equipment, or system in need of repair not previously disclosed?"

**If yes:** Text explanation required

### Section 5: Flood Zone Information (Y/N + wholly/partly)

**9 conditions** about flooding and flood zones.

**Auto-Population:**
- Platform fetches FEMA flood zone data
- Pre-fills based on property address
- Seller confirms or corrects

**Key Fields:**
- Present flood insurance coverage
- Previous flooding (reservoir breach, natural event, water penetration)
- 100-year floodplain (Zone A, V, AE, etc.)
- 500-year floodplain (Zone X shaded)
- Floodway, flood pool, reservoir

**Legal Definitions Shown:**
Display official definitions for each term in help text.

### Section 6: Flood Insurance Claims

Simple yes/no: "Ever filed flood claim with any provider including NFIP?"

**If yes:** Explanation required

### Section 7: FEMA/SBA Assistance

"Ever received FEMA or SBA assistance for flood damage?"

**If yes:** Explanation required

### Section 8: Additional Disclosures (Y/N for awareness)

**13 items** covering various legal and practical matters.

**Critical Items:**
- Unpermitted additions/repairs
- HOA fees/assessments (capture HOA name, manager, fees, mandatory/voluntary)
- Common areas (pools, tennis courts, etc.)
- Deed restriction violations
- Lawsuits affecting property
- Deaths on property (except natural causes/suicide/unrelated accidents)
- Health/safety conditions
- Environmental remediation (require certificates)
- Rainwater harvesting systems >500 gallons
- Propane gas system service area
- Groundwater conservation/subsidence district

**HOA Sub-form:**
```
Name of association: ___________
Manager's name: ___________  Phone: ___________
Fees/assessments: $_______ per _______
Mandatory or Voluntary: □ mandatory □ voluntary
Any unpaid fees? □ yes ($____) □ no
```

### Section 9: Inspection Reports

"Within last 4 years, received any written inspection reports?"

**If yes:** Table to complete:
- Inspection Date
- Type
- Name of Inspector
- Number of Pages

**Note to buyer:** "Do not rely on these as current condition. Get new inspections."

### Section 10: Tax Exemptions

Checkboxes for:
- Homestead
- Senior Citizen
- Disabled
- Wildlife Management
- Agricultural
- Disabled Veteran
- Other
- Unknown

**Auto-population:** Fetch from county tax records if available

### Section 11: Non-Flood Insurance Claims

"Ever filed claim for damage (other than flood) with any insurance provider?"

Simple yes/no.

### Section 12: Unrepaired Damage

"Ever received proceeds for claim and NOT used them to make repairs?"

**If yes:** Explanation required

**Legal significance:** High - buyers need to know about unremediated damage

### Section 13: Smoke Detectors

Required by Chapter 766, Health and Safety Code.

**Options:**
- Unknown
- No
- Yes

**If no/unknown:** Explanation required

**Additional:** Hearing-impaired smoke detector requirements if applicable

**Legal note:** Buyers can require seller to install hearing-impaired detectors if:
1. Buyer or family member is hearing-impaired
2. Buyer provides written evidence from physician
3. Request made within 10 days of effective date

## Implementation Architecture

### Frontend Component Structure

```
SellerDisclosure/
├── index.jsx                      # Main wizard container
├── DisclosureProgress.jsx         # Progress bar (sections completed)
├── Section1PropertyItems.jsx      # 91 items with grouped UI
├── Section2Defects.jsx            # 18 defect checkboxes
├── Section3Conditions.jsx         # 33 condition checkboxes
├── Section4Repairs.jsx            # Simple yes/no + explanation
├── Section5FloodZones.jsx         # 9 flood-related items
├── Section6FloodClaims.jsx        # Simple yes/no
├── Section7FEMAAssistance.jsx     # Simple yes/no
├── Section8Additional.jsx         # 13 items + HOA sub-form
├── Section9Inspections.jsx        # Table of reports
├── Section10TaxExemptions.jsx     # Checkbox list
├── Section11InsuranceClaims.jsx   # Simple yes/no
├── Section12UnrepairedDamage.jsx  # Yes/no + explanation
├── Section13SmokeDetectors.jsx    # Dropdown + explanation
├── ReviewAndSign.jsx              # Final review before submission
├── SignatureCapture.jsx           # Digital signature component
└── utils/
    ├── disclosureValidation.js    # Validation rules per section
    ├── autoDetection.js           # Auto-detect required forms
    ├── pdfGenerator.js            # Generate final PDF
    └── disclosureHelpers.js       # Utility functions
```

### Backend API Endpoints

```javascript
// Get disclosure for property
GET /api/disclosures/:propertyId

// Save/update disclosure (auto-save)
PUT /api/disclosures/:propertyId

// Submit completed disclosure
POST /api/disclosures/:propertyId/submit

// Generate PDF
POST /api/disclosures/:propertyId/generate-pdf

// Sign disclosure (buyer or seller)
POST /api/disclosures/:disclosureId/sign

// Get required additional forms
GET /api/disclosures/:propertyId/required-forms
```

### Auto-Save Strategy

**Every 30 seconds OR on section change:**
- Save current section data to database
- Show "Last saved: X seconds ago"
- No data loss if user navigates away

```javascript
const { disclosure, updateSection, save } = useDisclosure(propertyId);

useEffect(() => {
  const timer = setInterval(() => {
    save(); // Auto-save
  }, 30000);
  return () => clearInterval(timer);
}, [save]);
```

### Validation Rules

**Per-section validation:**
- Section 1: At least 50% of items must be answered (not all "Unknown")
- Section 2-3: If "Yes", explanation required
- Section 5: If in known flood zone, must confirm or deny
- Section 8: If HOA "Yes", all HOA fields required
- All sections: Prevent submission if critical fields missing

**Final validation:**
- All 13 sections completed
- No orphaned "Yes" answers without explanations
- Seller signature captured
- Auto-detected forms acknowledged

### PDF Generation

**Requirements:**
1. Use official TXR-1406 form as template
2. Fill in all checkbox fields
3. Include seller signature and date
4. Include buyer signature and date (when signed)
5. Store in S3 with restricted access
6. Generate unique URL for document retrieval

**Libraries:**
- PDFKit (Node.js) or pdf-lib
- Alternative: Use DocuSign API to fill official template

### Buyer Signature Flow

After seller completes and submits:

1. **Seller submits** → Status: "Awaiting Buyer Signature"
2. **Buyer receives notification** → Email + in-app
3. **Buyer reviews disclosure** → PDF view with all answers
4. **Buyer signs** → Digital signature capture
5. **Both signed** → Generate final PDF, store permanently
6. **Attach to transaction** → Part of official documents

## Testing Checklist

### Functional Tests

- [ ] All 91 items in Section 1 render correctly
- [ ] "Built before 1978" auto-triggers lead paint requirement
- [ ] Auto-save works every 30 seconds
- [ ] Can navigate between sections without losing data
- [ ] Validation prevents submission with incomplete sections
- [ ] HOA sub-form appears when HOA checkbox is "Yes"
- [ ] Signature capture works on both desktop and mobile
- [ ] PDF generation includes all data accurately
- [ ] Buyer can view and sign completed disclosure
- [ ] Final PDF is stored and retrievable

### Edge Cases

- [ ] User starts disclosure, leaves, comes back (data persists)
- [ ] User clicks "Unknown" for everything (validation catches)
- [ ] Property has no flood zone data (graceful handling)
- [ ] Multiple inspection reports (table supports dynamic rows)
- [ ] Seller changes answer after submission (versioning?)

## Legal Compliance Notes

### What Move-it Does:
✅ Provides digital form for seller to complete
✅ Auto-populates data from property records where possible
✅ Saves progress automatically
✅ Validates completeness
✅ Collects digital signatures
✅ Generates PDF for record-keeping

### What Move-it Does NOT Do:
❌ Provide legal advice
❌ Generate legal documents (attorneys create contracts)
❌ Represent buyer or seller
❌ Guarantee accuracy of seller's statements

### Disclaimers Shown:

**Header of disclosure:**
> "THIS NOTICE IS A DISCLOSURE OF SELLER'S KNOWLEDGE OF THE CONDITION OF THE PROPERTY AS OF THE DATE SIGNED BY SELLER AND IS NOT A SUBSTITUTE FOR ANY INSPECTIONS OR WARRANTIES THE BUYER MAY WISH TO OBTAIN."

**Footer:**
> "Move-it is a marketplace facilitating connections. This disclosure is completed by the seller. We do not represent any party. All legal documents are prepared by licensed attorneys."

## Success Metrics

- Average completion time: Target <30 minutes
- Auto-save success rate: >99%
- PDF generation success: 100%
- Buyer signature completion: >95% within 48 hours
- Legal compliance: Zero violations

## Future Enhancements

1. **Smart suggestions:** "Based on year built (1975), you may need to disclose lead-based paint"
2. **Photo uploads:** Attach photos to defect explanations
3. **Comparison tool:** Show buyer side-by-side with inspection report
4. **Mobile optimization:** Full mobile responsiveness with touch signatures
5. **Multi-language:** Spanish translation for Texas sellers
6. **Version history:** Track changes if seller updates after initial submission

---

**This is a complex, legally-critical feature. Build incrementally, test thoroughly, and have attorneys review before launch.**
