import React from 'react';
import { FileText, Check, AlertTriangle } from 'lucide-react';
import {
  YesNoSelector, TextArea, InfoBox, SectionHeader
} from '../components/FormComponents';

const Section6FloodClaims = ({ data, onUpdate }) => {
  return (
    <div>
      <SectionHeader
        number={6}
        title="Flood Insurance Claims"
        subtitle="History of flood damage claims"
      />

      <InfoBox type="info">
        Homes in high-risk flood zones with federally regulated mortgages are required to have
        flood insurance. FEMA encourages all homeowners to purchase flood insurance regardless
        of flood zone designation.
      </InfoBox>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-2">
              Have you ever filed a claim for flood damage with an insurance company or the
              National Flood Insurance Program (NFIP)?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This includes any claims made while you have owned this property.
            </p>

            <YesNoSelector
              value={data.flood_claim}
              onChange={(v) => onUpdate('section6', 'flood_claim', v)}
            />
          </div>
        </div>

        {data.flood_claim === true && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-gray-800">Claim Details Required</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Please provide information about the flood claim(s).
                </p>
              </div>
            </div>
            <TextArea
              value={data.explanation}
              onChange={(v) => onUpdate('section6', 'explanation', v)}
              placeholder="Include: Date of flood event, amount of claim, insurance company name, repairs made, and any relevant details..."
              rows={5}
            />
          </div>
        )}

        {data.flood_claim === false && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-700">
              No flood insurance claims have been filed for this property.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section6FloodClaims;
