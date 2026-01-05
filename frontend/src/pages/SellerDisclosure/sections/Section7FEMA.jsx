import React from 'react';
import { Building2, Check, AlertTriangle } from 'lucide-react';
import {
  YesNoSelector, TextArea, InfoBox, SectionHeader
} from '../components/FormComponents';

const Section7FEMA = ({ data, onUpdate }) => {
  return (
    <div>
      <SectionHeader
        number={7}
        title="FEMA/SBA Assistance"
        subtitle="Federal disaster assistance history"
      />

      <InfoBox type="info">
        FEMA (Federal Emergency Management Agency) and SBA (Small Business Administration)
        provide disaster assistance including grants and low-interest loans to help property
        owners recover from flooding and other natural disasters.
      </InfoBox>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Building2 className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-2">
              Have you ever received assistance from FEMA or the SBA for flood damage to
              this property?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This includes grants, loans, or other forms of disaster relief assistance.
            </p>

            <YesNoSelector
              value={data.fema_assistance}
              onChange={(v) => onUpdate('section7', 'fema_assistance', v)}
            />
          </div>
        </div>

        {data.fema_assistance === true && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-gray-800">Assistance Details Required</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Please provide information about the assistance received.
                </p>
              </div>
            </div>
            <TextArea
              value={data.explanation}
              onChange={(v) => onUpdate('section7', 'explanation', v)}
              placeholder="Include: Type of assistance (FEMA/SBA), approximate amount, year received, purpose of assistance, and any relevant details..."
              rows={5}
            />
          </div>
        )}

        {data.fema_assistance === false && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-700">
              No FEMA or SBA assistance has been received for this property.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section7FEMA;
