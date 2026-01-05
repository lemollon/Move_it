import React from 'react';
import { CloudRain, Shield, MapPin, AlertTriangle, Check } from 'lucide-react';
import {
  YesNoSelector, QuestionRow, QuestionGroup, RadioGroup, TextArea,
  InfoBox, SectionHeader, ConditionalField
} from '../components/FormComponents';

// Flood zone items with wholly/partly option
const FLOOD_LOCATION_ITEMS = [
  {
    id: 'flood_100yr_floodplain',
    label: 'Located in 100-year floodplain',
    helpText: 'Zone A, V, A99, AE, AO, AH, VE, AR - 1% annual chance of flooding (high risk)'
  },
  {
    id: 'flood_500yr_floodplain',
    label: 'Located in 500-year floodplain',
    helpText: 'Zone X (shaded) - 0.2% annual chance of flooding (moderate risk)'
  },
  {
    id: 'flood_floodway',
    label: 'Located in a floodway',
    helpText: 'Area reserved for discharge of base flood without increasing water surface elevation'
  },
  {
    id: 'flood_flood_pool',
    label: 'Located in a flood pool',
    helpText: 'Area adjacent to reservoir above normal maximum operating level'
  },
  {
    id: 'flood_reservoir',
    label: 'Located in a reservoir',
    helpText: 'Water impoundment project operated by US Army Corps of Engineers'
  },
];

const Section5Flood = ({ data, onUpdate, onNestedUpdate }) => {
  const floodData = data.flood_data || {};

  const setFloodItem = (id, field, value) => {
    onNestedUpdate('section5', 'flood_data', id, {
      ...(floodData[id] || {}),
      [field]: value
    });
  };

  const hasAnyYes = Object.values(floodData).some(item =>
    typeof item === 'object' ? item.value === true : item === true
  );

  return (
    <div>
      <SectionHeader
        number={5}
        title="Flood-Related Conditions"
        subtitle="Information about flood history and flood zone status"
      />

      <InfoBox type="info">
        If the Buyer is concerned about flooding, they may consult "Information About Flood Hazards" (TXR 1414).
        This section helps buyers understand the property's flood risk and history.
      </InfoBox>

      <div className="mt-6 space-y-4">
        {/* Insurance & History */}
        <QuestionGroup title="Flood Insurance & History" icon={Shield}>
          <QuestionRow label="Is there present flood insurance coverage on this property?">
            <YesNoSelector
              value={floodData.flood_insurance_present}
              onChange={(v) => onNestedUpdate('section5', 'flood_data', 'flood_insurance_present', v)}
            />
          </QuestionRow>

          <QuestionRow label="Has there been previous flooding due to reservoir failure, breach, or release?">
            <YesNoSelector
              value={floodData.flood_reservoir_breach}
              onChange={(v) => onNestedUpdate('section5', 'flood_data', 'flood_reservoir_breach', v)}
            />
          </QuestionRow>

          <QuestionRow label="Has there been previous flooding due to a natural flood event?">
            <YesNoSelector
              value={floodData.flood_natural_event}
              onChange={(v) => onNestedUpdate('section5', 'flood_data', 'flood_natural_event', v)}
            />
          </QuestionRow>

          <QuestionRow label="Has there been previous water penetration into the structure due to a natural flood event?">
            <YesNoSelector
              value={floodData.flood_water_penetration}
              onChange={(v) => onNestedUpdate('section5', 'flood_data', 'flood_water_penetration', v)}
            />
          </QuestionRow>
        </QuestionGroup>

        {/* Flood Zone Location */}
        <QuestionGroup title="Flood Zone Location" icon={MapPin}>
          <InfoBox type="warning">
            For items below, if you answer "Yes", please indicate whether the property is
            <strong> wholly</strong> (entirely) or <strong>partly</strong> (partially) located in the zone.
          </InfoBox>

          {FLOOD_LOCATION_ITEMS.map(item => {
            const itemData = floodData[item.id] || {};

            return (
              <div key={item.id}>
                <QuestionRow
                  label={item.label}
                  helpText={item.helpText}
                  highlight={itemData.value === true}
                >
                  <YesNoSelector
                    value={itemData.value}
                    onChange={(v) => setFloodItem(item.id, 'value', v)}
                  />
                </QuestionRow>

                {itemData.value === true && (
                  <ConditionalField show={true}>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Extent:</span>
                      <RadioGroup
                        options={[
                          { value: 'wholly', label: 'Wholly (entire property)' },
                          { value: 'partly', label: 'Partly (portion of property)' }
                        ]}
                        value={itemData.extent}
                        onChange={(v) => setFloodItem(item.id, 'extent', v)}
                      />
                    </div>
                  </ConditionalField>
                )}
              </div>
            );
          })}
        </QuestionGroup>

        {/* Flood Definitions Reference */}
        <QuestionGroup title="Flood Zone Definitions" icon={CloudRain} defaultOpen={false}>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <strong className="text-gray-800">100-year floodplain:</strong> Any area identified on a flood
              insurance rate map as a special flood hazard area (Zone A, V, A99, AE, AO, AH, VE, or AR).
              Has a 1% annual chance of flooding (high risk).
            </div>
            <div>
              <strong className="text-gray-800">500-year floodplain:</strong> Any area identified on a flood
              insurance rate map as a moderate flood hazard area (Zone X shaded). Has a 0.2% annual chance
              of flooding (moderate risk).
            </div>
            <div>
              <strong className="text-gray-800">Floodway:</strong> Area identified on flood insurance rate
              map as a regulatory floodway. Includes the channel of a river/watercourse and adjacent land
              areas reserved for discharge of the base flood.
            </div>
            <div>
              <strong className="text-gray-800">Flood pool:</strong> Area adjacent to a reservoir above
              the normal maximum operating level, subject to controlled inundation under US Army Corps
              of Engineers management.
            </div>
            <div>
              <strong className="text-gray-800">Reservoir:</strong> A water impoundment project operated
              by the US Army Corps of Engineers to retain or delay runoff in a designated surface area.
            </div>
          </div>
        </QuestionGroup>

        {/* Explanation if any Yes */}
        {hasAnyYes && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-yellow-800">Please Provide Details</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You indicated flood-related conditions. Please provide any additional details or context.
                </p>
              </div>
            </div>
            <TextArea
              value={data.explanation}
              onChange={(v) => onUpdate('section5', 'explanation', v)}
              placeholder="Describe any flood history, damage, repairs made, flood mitigation measures installed, etc..."
              rows={4}
            />
          </div>
        )}

        {!hasAnyYes && Object.keys(floodData).length > 3 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-700">
              No flood-related conditions reported.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section5Flood;
