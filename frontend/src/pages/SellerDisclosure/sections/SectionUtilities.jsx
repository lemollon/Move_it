import React from 'react';
import { Zap, Droplets, Trash2, Wifi, Flame, Phone } from 'lucide-react';
import { TextInput, QuestionGroup, SectionHeader, InfoBox } from '../components/FormComponents';

const UTILITY_PROVIDERS = [
  { id: 'electric', label: 'Electric', icon: Zap },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'sewer', label: 'Sewer', icon: Droplets },
  { id: 'natural_gas', label: 'Natural Gas', icon: Flame },
  { id: 'propane', label: 'Propane', icon: Flame },
  { id: 'trash', label: 'Trash', icon: Trash2 },
  { id: 'cable', label: 'Cable TV', icon: Wifi },
  { id: 'internet', label: 'Internet', icon: Wifi },
  { id: 'phone', label: 'Phone Company', icon: Phone },
];

const SectionUtilities = ({ data, onUpdate }) => {
  const utilities = data || {};

  const updateUtility = (id, field, value) => {
    onUpdate('utilities', id, {
      ...(utilities[id] || {}),
      [field]: value
    });
  };

  return (
    <div>
      <SectionHeader
        number="+"
        title="Utility Service Providers"
        subtitle="Current utility providers for the property"
      />

      <InfoBox type="info">
        This information helps the buyer know who to contact for utility services.
        Fill in what you know - all fields are optional.
      </InfoBox>

      <div className="mt-6">
        <QuestionGroup title="Current Service Providers" icon={Zap} defaultOpen={true}>
          <div className="space-y-4">
            {UTILITY_PROVIDERS.map(utility => {
              const utilityData = utilities[utility.id] || {};
              const Icon = utility.icon;

              return (
                <div key={utility.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {utility.label} Provider
                      </label>
                      <TextInput
                        value={utilityData.provider}
                        onChange={(v) => updateUtility(utility.id, 'provider', v)}
                        placeholder={`${utility.label} company name...`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <TextInput
                        value={utilityData.phone}
                        onChange={(v) => updateUtility(utility.id, 'phone', v)}
                        placeholder="(xxx) xxx-xxxx"
                        icon={Phone}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </QuestionGroup>
      </div>
    </div>
  );
};

export default SectionUtilities;
