import React from 'react';
import { AlertCircle, Check, Info } from 'lucide-react';
import { RadioGroup, TextArea, InfoBox, SectionHeader } from '../components/FormComponents';

const Section13SmokeDetectors = ({ data, onUpdate }) => {
  return (
    <div>
      <SectionHeader
        number={13}
        title="Smoke Detectors"
        subtitle="Working smoke detectors as required by Chapter 766"
      />

      <InfoBox type="info">
        <strong>Texas Property Code Chapter 766</strong> requires working smoke detectors
        that meet building code requirements for performance, location, and power source.
      </InfoBox>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-2">
              Does this property have working smoke detectors installed in accordance with
              the requirements of Chapter 766, Health and Safety Code?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Smoke detectors should be properly located and have working batteries or hardwired power.
            </p>

            <RadioGroup
              options={[
                { value: 'yes', label: 'Yes - Working smoke detectors are installed' },
                { value: 'no', label: 'No - Smoke detectors are not compliant or not installed' },
                { value: 'unknown', label: 'Unknown - I am not sure about the status' }
              ]}
              value={data.smoke_detectors}
              onChange={(v) => onUpdate('section13', 'smoke_detectors', v)}
              inline={false}
            />
          </div>
        </div>

        {data.smoke_detectors === 'yes' && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-700">
              Property has compliant smoke detectors installed.
            </span>
          </div>
        )}

        {(data.smoke_detectors === 'no' || data.smoke_detectors === 'unknown') && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please explain:
            </label>
            <TextArea
              value={data.explanation}
              onChange={(v) => onUpdate('section13', 'explanation', v)}
              placeholder="Explain the current status of smoke detectors in the property..."
              rows={3}
            />
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Important Information for Buyers:</p>
              <p>
                A buyer may require the seller to install smoke detectors for the hearing impaired if:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The buyer or a member of the buyer's family is hearing impaired</li>
                <li>The buyer provides written evidence from a licensed physician</li>
                <li>The buyer makes a written request within 10 days of the effective date, specifying locations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section13SmokeDetectors;
