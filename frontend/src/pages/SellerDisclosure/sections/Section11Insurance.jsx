import React from 'react';
import { Shield, Check, AlertTriangle } from 'lucide-react';
import { YesNoSelector, InfoBox, SectionHeader } from '../components/FormComponents';

const Section11Insurance = ({ data, onUpdate }) => {
  return (
    <div>
      <SectionHeader
        number={11}
        title="Insurance Claims (Non-Flood)"
        subtitle="History of property damage claims other than flood"
      />

      <InfoBox type="info">
        This section covers insurance claims for damage other than flooding,
        such as fire, wind, hail, theft, or other covered perils.
        Flood-related claims were covered in Section 6.
      </InfoBox>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-2">
              Have you ever filed a claim for damage to this property with an insurance
              company (other than flood damage)?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This includes homeowner's insurance claims for fire, storm damage, theft, liability, etc.
            </p>

            <YesNoSelector
              value={data.insurance_claims}
              onChange={(v) => onUpdate('section11', 'insurance_claims', v)}
            />
          </div>
        </div>

        {data.insurance_claims === true && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">Claim History Noted</p>
              <p className="mt-1">
                Insurance claims are part of the property's history and may be discoverable by the buyer
                through a CLUE (Comprehensive Loss Underwriting Exchange) report.
              </p>
            </div>
          </div>
        )}

        {data.insurance_claims === false && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-700">
              No non-flood insurance claims have been filed for this property.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section11Insurance;
