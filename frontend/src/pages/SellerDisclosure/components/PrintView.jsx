import React, { forwardRef } from 'react';

// Y/N/U display helper
const YNUDisplay = ({ value }) => {
  if (value === 'yes' || value === true) return <span className="font-medium">Yes</span>;
  if (value === 'no' || value === false) return <span className="font-medium">No</span>;
  if (value === 'unknown') return <span className="font-medium">Unknown</span>;
  return <span className="text-gray-400">—</span>;
};

// Section header component
const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-2 py-2 border-b-2 border-black mb-3 mt-6 first:mt-0">
    <span className="font-bold text-lg">SECTION {number}:</span>
    <span className="font-bold text-lg uppercase">{title}</span>
  </div>
);

// Property item row
const PropertyItemRow = ({ label, value }) => (
  <div className="flex items-center gap-2 py-1 border-b border-gray-200">
    <span className="flex-1">{label}</span>
    <div className="flex gap-4 text-sm">
      <span className={value === 'yes' ? 'font-bold' : 'text-gray-400'}>Y</span>
      <span className={value === 'no' ? 'font-bold' : 'text-gray-400'}>N</span>
      <span className={value === 'unknown' ? 'font-bold' : 'text-gray-400'}>U</span>
    </div>
  </div>
);

// Explanation box
const ExplanationBox = ({ label, value }) => (
  value ? (
    <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
      <p className="text-xs text-gray-500 mb-1">{label}:</p>
      <p className="text-sm">{value}</p>
    </div>
  ) : null
);

export const PrintView = forwardRef(({ disclosure, property }, ref) => {
  const header = disclosure?.header_data || {};
  const seller = disclosure?.seller || {};

  return (
    <div
      ref={ref}
      className="print-view bg-white p-8 max-w-4xl mx-auto text-sm leading-relaxed"
      style={{ fontFamily: 'Times New Roman, serif' }}
    >
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold mb-1">SELLER'S DISCLOSURE NOTICE</h1>
        <p className="text-sm text-gray-600">Texas Association of REALTORS® Form TXR-1406</p>
      </div>

      {/* Property Info */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-300">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">PROPERTY ADDRESS:</p>
            <p className="font-medium">{header.property_address || property?.getFullAddress?.() || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">DATE:</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div>
            <p className="text-xs text-gray-500">CITY:</p>
            <p>{header.city || property?.city || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">COUNTY:</p>
            <p>{header.county || property?.county || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ZIP:</p>
            <p>{header.zip_code || property?.zip_code || '—'}</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-6 p-3 bg-yellow-50 border border-yellow-300 text-xs">
        <p className="font-bold mb-1">NOTICE TO BUYER:</p>
        <p>
          The representations in this notice are those of the seller only. This disclosure is not a warranty
          by the seller or any agent. A buyer should use this information only as a starting point for
          an independent investigation of the property before purchasing.
        </p>
      </div>

      {/* Section 1: Property Items */}
      <SectionHeader number={1} title="Property Items" />
      <p className="text-xs text-gray-600 mb-3">
        The Property includes the items listed below (Y=Yes, N=No, U=Unknown):
      </p>

      <div className="grid grid-cols-2 gap-x-8">
        {Object.entries(disclosure?.section1_property_items || {}).map(([key, value]) => (
          <PropertyItemRow
            key={key}
            label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            value={value}
          />
        ))}
      </div>

      <div className="mt-4">
        <p className="font-medium">Water Supply:</p>
        <p className="ml-4">
          Provider: {disclosure?.section1_water_supply?.provider || '—'} |
          Type: {disclosure?.section1_water_supply?.type || '—'}
        </p>
      </div>

      <div className="mt-4">
        <p className="font-medium">Roof Information:</p>
        <p className="ml-4">
          Type: {disclosure?.section1_roof_info?.roof_type || '—'} |
          Age: {disclosure?.section1_roof_info?.roof_age || '—'} |
          Built before 1978: <YNUDisplay value={disclosure?.section1_roof_info?.built_before_1978} />
        </p>
      </div>

      <ExplanationBox
        label="Defects/Explanation"
        value={disclosure?.section1_defects_explanation}
      />

      {/* Section 2: Defects */}
      <SectionHeader number={2} title="Defects or Malfunctions" />
      <p className="text-xs text-gray-600 mb-3">
        Are you aware of any defects or malfunctions in any of the following items?
      </p>

      <div className="grid grid-cols-2 gap-x-8">
        {Object.entries(disclosure?.section2_defects || {}).map(([key, value]) => (
          <PropertyItemRow
            key={key}
            label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            value={value}
          />
        ))}
      </div>

      <ExplanationBox
        label="Explanation of defects"
        value={disclosure?.section2_explanation}
      />

      {/* Section 3: Conditions */}
      <SectionHeader number={3} title="Awareness of Conditions" />
      <p className="text-xs text-gray-600 mb-3">
        Are you aware of any of the following conditions?
      </p>

      <div className="grid grid-cols-2 gap-x-8">
        {Object.entries(disclosure?.section3_conditions || {}).map(([key, value]) => (
          <PropertyItemRow
            key={key}
            label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            value={value}
          />
        ))}
      </div>

      <ExplanationBox
        label="Explanation of conditions"
        value={disclosure?.section3_explanation}
      />

      {/* Section 4: Additional Repairs */}
      <SectionHeader number={4} title="Additional Repairs" />
      <div className="flex items-center gap-4">
        <span>Are you aware of any additional repairs the Property needs?</span>
        <YNUDisplay value={disclosure?.section4_additional_repairs} />
      </div>
      <ExplanationBox
        label="Details of repairs needed"
        value={disclosure?.section4_explanation}
      />

      {/* Section 5: Flood */}
      <SectionHeader number={5} title="Flood-Related Conditions" />
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-gray-200 py-1">
          <span>Flood insurance currently in force?</span>
          <YNUDisplay value={disclosure?.section5_flood_data?.flood_insurance_present} />
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 py-1">
          <span>Property ever flooded?</span>
          <YNUDisplay value={disclosure?.section5_flood_data?.previous_flooding} />
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 py-1">
          <span>In 100-year floodplain?</span>
          <YNUDisplay value={disclosure?.section5_flood_data?.in_100_year_floodplain} />
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 py-1">
          <span>In 500-year floodplain?</span>
          <YNUDisplay value={disclosure?.section5_flood_data?.in_500_year_floodplain} />
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 py-1">
          <span>In regulatory floodway?</span>
          <YNUDisplay value={disclosure?.section5_flood_data?.in_floodway} />
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 py-1">
          <span>In flood pool?</span>
          <YNUDisplay value={disclosure?.section5_flood_data?.in_flood_pool} />
        </div>
      </div>
      <ExplanationBox label="Flood explanation" value={disclosure?.section5_explanation} />

      {/* Section 6: Flood Claims */}
      <SectionHeader number={6} title="Flood Insurance Claims" />
      <div className="flex items-center gap-4">
        <span>Have you ever filed a claim for flood damage to the Property?</span>
        <YNUDisplay value={disclosure?.section6_flood_claim} />
      </div>
      <ExplanationBox label="Details" value={disclosure?.section6_explanation} />

      {/* Section 7: FEMA */}
      <SectionHeader number={7} title="FEMA/SBA Assistance" />
      <div className="flex items-center gap-4">
        <span>Have you ever received FEMA or SBA assistance for flood damage?</span>
        <YNUDisplay value={disclosure?.section7_fema_assistance} />
      </div>
      <ExplanationBox label="Details" value={disclosure?.section7_explanation} />

      {/* Section 8: Legal/HOA */}
      <SectionHeader number={8} title="Legal, HOA, and Property Conditions" />
      <div className="space-y-2">
        {Object.entries(disclosure?.section8_conditions || {}).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between border-b border-gray-200 py-1">
            <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <YNUDisplay value={value} />
          </div>
        ))}
      </div>

      {disclosure?.section8_hoa_details && Object.keys(disclosure.section8_hoa_details).length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="font-medium mb-2">HOA Details:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(disclosure.section8_hoa_details).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>{' '}
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <ExplanationBox label="Details" value={disclosure?.section8_explanation} />

      {/* Section 9: Inspections */}
      <SectionHeader number={9} title="Inspection Reports" />
      <div className="flex items-center gap-4">
        <span>Do you have copies of any previous inspection reports?</span>
        <YNUDisplay value={disclosure?.section9_has_reports} />
      </div>
      {disclosure?.section9_reports?.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="font-medium mb-2">Reports:</p>
          <ul className="list-disc list-inside text-sm">
            {disclosure.section9_reports.map((report, idx) => (
              <li key={idx}>
                {report.type} - {report.date} - {report.inspector}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 10: Tax Exemptions */}
      <SectionHeader number={10} title="Tax Exemptions" />
      {disclosure?.section10_exemptions?.length > 0 ? (
        <ul className="list-disc list-inside">
          {disclosure.section10_exemptions.map((exemption, idx) => (
            <li key={idx}>{exemption.replace(/_/g, ' ')}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No tax exemptions claimed</p>
      )}

      {/* Section 11: Insurance Claims */}
      <SectionHeader number={11} title="Insurance Claims (Non-Flood)" />
      <div className="flex items-center gap-4">
        <span>Have you filed any insurance claims in the past 5 years?</span>
        <YNUDisplay value={disclosure?.section11_insurance_claims} />
      </div>

      {/* Section 12: Unremediated */}
      <SectionHeader number={12} title="Unremediated Claims" />
      <div className="flex items-center gap-4">
        <span>Are there any unremediated claims or conditions?</span>
        <YNUDisplay value={disclosure?.section12_unremediated_claims} />
      </div>
      <ExplanationBox label="Details" value={disclosure?.section12_explanation} />

      {/* Section 13: Smoke Detectors */}
      <SectionHeader number={13} title="Smoke Detectors" />
      <div className="flex items-center gap-4">
        <span>Are smoke detectors installed per Chapter 766 of Texas Health & Safety Code?</span>
        <span className="font-medium">
          {disclosure?.section13_smoke_detectors?.toUpperCase() || '—'}
        </span>
      </div>
      <ExplanationBox label="Details" value={disclosure?.section13_explanation} />

      {/* Utility Providers */}
      {disclosure?.utility_providers && Object.keys(disclosure.utility_providers).length > 0 && (
        <>
          <SectionHeader number="" title="Utility Providers" />
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(disclosure.utility_providers).map(([key, value]) => (
              <div key={key} className="border-b border-gray-200 py-1">
                <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>{' '}
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Signatures */}
      <div className="mt-8 pt-6 border-t-2 border-black">
        <h2 className="font-bold text-lg mb-4">SIGNATURES</h2>

        <div className="grid grid-cols-2 gap-8">
          {/* Seller Signatures */}
          <div>
            <p className="font-medium mb-4">SELLER(S):</p>
            <div className="space-y-6">
              <div>
                <div className="border-b border-black h-12 flex items-end pb-1">
                  {disclosure?.seller1_signature?.signature_data && (
                    <img
                      src={disclosure.seller1_signature.signature_data}
                      alt="Seller 1 Signature"
                      className="h-10 object-contain"
                    />
                  )}
                </div>
                <p className="text-xs mt-1">
                  {disclosure?.seller1_signature?.printed_name || 'Seller 1'} |
                  Date: {disclosure?.seller1_signature?.date || '___________'}
                </p>
              </div>
              <div>
                <div className="border-b border-black h-12 flex items-end pb-1">
                  {disclosure?.seller2_signature?.signature_data && (
                    <img
                      src={disclosure.seller2_signature.signature_data}
                      alt="Seller 2 Signature"
                      className="h-10 object-contain"
                    />
                  )}
                </div>
                <p className="text-xs mt-1">
                  {disclosure?.seller2_signature?.printed_name || 'Seller 2'} |
                  Date: {disclosure?.seller2_signature?.date || '___________'}
                </p>
              </div>
            </div>
          </div>

          {/* Buyer Signatures */}
          <div>
            <p className="font-medium mb-4">BUYER(S) ACKNOWLEDGMENT:</p>
            <div className="space-y-6">
              <div>
                <div className="border-b border-black h-12 flex items-end pb-1">
                  {disclosure?.buyer1_signature?.signature_data && (
                    <img
                      src={disclosure.buyer1_signature.signature_data}
                      alt="Buyer 1 Signature"
                      className="h-10 object-contain"
                    />
                  )}
                </div>
                <p className="text-xs mt-1">
                  {disclosure?.buyer1_signature?.printed_name || 'Buyer 1'} |
                  Date: {disclosure?.buyer1_signature?.date || '___________'}
                </p>
              </div>
              <div>
                <div className="border-b border-black h-12 flex items-end pb-1">
                  {disclosure?.buyer2_signature?.signature_data && (
                    <img
                      src={disclosure.buyer2_signature.signature_data}
                      alt="Buyer 2 Signature"
                      className="h-10 object-contain"
                    />
                  )}
                </div>
                <p className="text-xs mt-1">
                  {disclosure?.buyer2_signature?.printed_name || 'Buyer 2'} |
                  Date: {disclosure?.buyer2_signature?.date || '___________'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
        <p>Generated via Move-it Platform | Form TXR-1406</p>
        <p>This is not a warranty. Buyer should independently verify all information.</p>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .print-view {
            padding: 0.5in;
            font-size: 11pt;
            max-width: 100%;
          }
          .print-view * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            margin: 0.5in;
            size: letter;
          }
        }
      `}</style>
    </div>
  );
});

PrintView.displayName = 'PrintView';

export default PrintView;
