import React from 'react';
import { Wrench, Check } from 'lucide-react';
import {
  YesNoSelector, TextArea, InfoBox, SectionHeader
} from '../components/FormComponents';

const Section4Repairs = ({ data, onUpdate }) => {
  return (
    <div>
      <SectionHeader
        number={4}
        title="Additional Repair Needs"
        subtitle="Items needing repair that were not previously disclosed"
      />

      <InfoBox type="info">
        This section covers any additional items, equipment, or systems that need repair
        which were not already disclosed in the previous sections.
      </InfoBox>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Wrench className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-2">
              Are there any items, equipment, or systems needing repair that have not been
              previously disclosed in this notice?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Consider appliances, HVAC systems, plumbing, electrical, structural elements,
              or any other component of the property.
            </p>

            <YesNoSelector
              value={data.additional_repairs}
              onChange={(v) => onUpdate('section4', 'additional_repairs', v)}
            />
          </div>
        </div>

        {data.additional_repairs === true && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please describe the items needing repair:
            </label>
            <TextArea
              value={data.explanation}
              onChange={(v) => onUpdate('section4', 'explanation', v)}
              placeholder="Describe what needs repair, the nature of the issue, and any estimates or plans for repair..."
              rows={5}
            />
          </div>
        )}

        {data.additional_repairs === false && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-700">
              No additional repair needs to disclose.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section4Repairs;
