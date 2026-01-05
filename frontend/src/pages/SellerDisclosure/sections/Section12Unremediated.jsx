import React from 'react';
import { Hammer, Check, AlertTriangle } from 'lucide-react';
import { YesNoSelector, TextArea, InfoBox, SectionHeader } from '../components/FormComponents';

const Section12Unremediated = ({ data, onUpdate }) => {
  return (
    <div>
      <SectionHeader
        number={12}
        title="Unremediated Claims"
        subtitle="Insurance proceeds received but repairs not completed"
      />

      <InfoBox type="warning">
        This is an important disclosure. If you received insurance money for damage but
        did not make the repairs, this must be disclosed to potential buyers.
      </InfoBox>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Hammer className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-2">
              Have you received claim proceeds for damage to this property but not made
              the repairs?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This applies if insurance paid for damage repairs that were never completed.
            </p>

            <YesNoSelector
              value={data.unremediated_claims}
              onChange={(v) => onUpdate('section12', 'unremediated_claims', v)}
            />
          </div>
        </div>

        {data.unremediated_claims === true && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-red-700">Important: Details Required</h4>
                <p className="text-sm text-red-600 mt-1">
                  You must explain what damage occurred, when, and why repairs were not made.
                </p>
              </div>
            </div>
            <TextArea
              value={data.explanation}
              onChange={(v) => onUpdate('section12', 'explanation', v)}
              placeholder="Describe: What damage occurred, when did it happen, what insurance proceeds were received, and why repairs were not completed..."
              rows={5}
            />
          </div>
        )}

        {data.unremediated_claims === false && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-700">
              No unremediated insurance claims exist for this property.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section12Unremediated;
