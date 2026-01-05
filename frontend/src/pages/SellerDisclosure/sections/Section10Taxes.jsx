import React from 'react';
import { Receipt, Info } from 'lucide-react';
import {
  CheckboxGroup, TextInput, InfoBox, SectionHeader, ConditionalField
} from '../components/FormComponents';

const TAX_EXEMPTIONS = [
  { value: 'homestead', label: 'Homestead' },
  { value: 'senior_citizen', label: 'Senior Citizen' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'disabled_veteran', label: 'Disabled Veteran' },
  { value: 'wildlife_management', label: 'Wildlife Management' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'other', label: 'Other' },
];

const Section10Taxes = ({ data, onUpdate }) => {
  const exemptions = data.exemptions || [];
  const hasOther = Array.isArray(exemptions)
    ? exemptions.some(e => typeof e === 'object' ? e.value === 'other' : e === 'other')
    : false;

  const handleExemptionsChange = (newValues) => {
    onUpdate('section10', 'exemptions', newValues);
  };

  return (
    <div>
      <SectionHeader
        number={10}
        title="Tax Exemptions"
        subtitle="Current property tax exemptions claimed"
      />

      <InfoBox type="info">
        Property tax exemptions can significantly affect the property tax amount.
        The buyer should verify current exemptions and eligibility for any exemptions they may qualify for.
      </InfoBox>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Receipt className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-2">
              What tax exemption(s) are currently claimed on this property?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Select all that apply. If you're unsure, select "Unknown".
            </p>

            <CheckboxGroup
              options={TAX_EXEMPTIONS}
              values={exemptions}
              onChange={handleExemptionsChange}
            />

            {hasOther && (
              <ConditionalField show={true}>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify other exemption(s):
                  </label>
                  <TextInput
                    value={data.exemptions_other}
                    onChange={(v) => onUpdate('section10', 'exemptions_other', v)}
                    placeholder="Describe other tax exemptions..."
                    className="max-w-md"
                  />
                </div>
              </ConditionalField>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Common Texas Tax Exemptions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Homestead:</strong> Available to homeowners who occupy the property as their primary residence</li>
                <li><strong>Over 65/Senior Citizen:</strong> Additional exemption for homeowners 65 or older</li>
                <li><strong>Disabled:</strong> For homeowners who are disabled</li>
                <li><strong>Disabled Veteran:</strong> For veterans with service-connected disabilities</li>
                <li><strong>Agricultural:</strong> For land used primarily for agricultural purposes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section10Taxes;
