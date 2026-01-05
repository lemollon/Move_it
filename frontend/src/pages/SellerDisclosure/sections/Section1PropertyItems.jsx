import React from 'react';
import {
  Thermometer, Flame, Droplets, Home, Shield, Tv, Car,
  Sun, Leaf, PocketKnife, Waves, Plug, Wind
} from 'lucide-react';
import {
  YNUSelector, QuestionRow, QuestionGroup, RadioGroup,
  NumberInput, TextInput, TextArea, ConditionalField, InfoBox, SectionHeader
} from '../components/FormComponents';

// Property item definitions organized by category
const PROPERTY_ITEMS = {
  heating_cooling: {
    title: 'Heating & Cooling',
    icon: Thermometer,
    items: [
      { id: 'central_ac', label: 'Central A/C', hasType: true, hasUnits: true, typeOptions: ['electric', 'gas'] },
      { id: 'evaporative_coolers', label: 'Evaporative Coolers', hasUnits: true },
      { id: 'wall_window_ac', label: 'Wall/Window AC Units', hasUnits: true },
      { id: 'attic_fan', label: 'Attic Fan(s)', hasDescribe: true },
      { id: 'central_heat', label: 'Central Heat', hasType: true, hasUnits: true, typeOptions: ['electric', 'gas'] },
      { id: 'other_heat', label: 'Other Heat', hasDescribe: true },
    ]
  },
  kitchen: {
    title: 'Kitchen Appliances',
    icon: Flame,
    items: [
      { id: 'cooktop', label: 'Cooktop' },
      { id: 'dishwasher', label: 'Dishwasher' },
      { id: 'disposal', label: 'Disposal' },
      { id: 'microwave', label: 'Microwave' },
      { id: 'oven', label: 'Oven', hasUnits: true, hasType: true, typeOptions: ['electric', 'gas', 'other'], hasOtherSpecify: true },
      { id: 'range_stove', label: 'Range/Stove' },
      { id: 'trash_compactor', label: 'Trash Compactor' },
    ]
  },
  water_plumbing: {
    title: 'Water & Plumbing',
    icon: Droplets,
    items: [
      { id: 'plumbing_system', label: 'Plumbing System' },
      { id: 'water_heater', label: 'Water Heater', hasType: true, hasUnits: true, typeOptions: ['electric', 'gas', 'other'], hasOtherSpecify: true },
      { id: 'water_softener', label: 'Water Softener', hasOwnership: true },
      { id: 'public_sewer_system', label: 'Public Sewer System' },
      { id: 'septic_onsite_sewer', label: 'Septic / On-Site Sewer Facility', helpText: 'If Yes, you must attach TXR-1407 form' },
      { id: 'pump_sump', label: 'Pump: Sump' },
      { id: 'pump_grinder', label: 'Pump: Grinder' },
      { id: 'french_drain', label: 'French Drain' },
    ]
  },
  gas_fuel: {
    title: 'Gas & Fuel',
    icon: Flame,
    items: [
      { id: 'gas_fixtures', label: 'Gas Fixtures' },
      { id: 'natural_gas_lines', label: 'Natural Gas Lines' },
      { id: 'liquid_propane_gas', label: 'Liquid Propane Gas', hasSubItems: true, subItems: [
        { id: 'lp_community', label: 'LP Community (Captive)' },
        { id: 'lp_on_property', label: 'LP on Property' }
      ]},
      { id: 'fuel_gas_piping', label: 'Fuel Gas Piping', hasSubItems: true, subItems: [
        { id: 'black_iron_pipe', label: 'Black Iron Pipe' },
        { id: 'copper_pipe', label: 'Copper' },
        { id: 'csst_pipe', label: 'Corrugated Stainless Steel Tubing (CSST)' }
      ]},
      { id: 'outdoor_grill', label: 'Outdoor Grill' },
    ]
  },
  safety: {
    title: 'Safety & Security',
    icon: Shield,
    items: [
      { id: 'carbon_monoxide_det', label: 'Carbon Monoxide Detector' },
      { id: 'fire_detection_equip', label: 'Fire Detection Equipment' },
      { id: 'smoke_detector', label: 'Smoke Detector' },
      { id: 'smoke_detector_hearing_impaired', label: 'Smoke Detector - Hearing Impaired' },
      { id: 'emergency_escape_ladder', label: 'Emergency Escape Ladder(s)' },
      { id: 'security_system', label: 'Security System', hasOwnership: true },
    ]
  },
  entertainment: {
    title: 'Entertainment & Technology',
    icon: Tv,
    items: [
      { id: 'cable_tv_wiring', label: 'Cable TV Wiring' },
      { id: 'tv_antenna', label: 'TV Antenna' },
      { id: 'satellite_dish', label: 'Satellite Dish & Controls', hasOwnership: true },
      { id: 'intercom_system', label: 'Intercom System' },
    ]
  },
  garage_parking: {
    title: 'Garage & Parking',
    icon: Car,
    items: [
      { id: 'carport', label: 'Carport', hasAttachment: true },
      { id: 'garage', label: 'Garage', hasAttachment: true },
      { id: 'garage_door_openers', label: 'Garage Door Openers', hasUnits: true, hasRemotes: true },
    ]
  },
  outdoor: {
    title: 'Outdoor Features',
    icon: Leaf,
    items: [
      { id: 'fences', label: 'Fences' },
      { id: 'patio_decking', label: 'Patio/Decking' },
      { id: 'underground_lawn_sprinkler', label: 'Underground Lawn Sprinkler', hasType: true, typeOptions: ['automatic', 'manual'], hasAreasCovered: true },
      { id: 'rain_gutters', label: 'Rain Gutters' },
    ]
  },
  pool_spa: {
    title: 'Pool & Spa',
    icon: Waves,
    items: [
      { id: 'pool', label: 'Pool' },
      { id: 'pool_equipment', label: 'Pool Equipment' },
      { id: 'pool_maint_accessories', label: 'Pool Maintenance Accessories' },
      { id: 'pool_heater', label: 'Pool Heater' },
      { id: 'hot_tub', label: 'Hot Tub' },
      { id: 'spa', label: 'Spa' },
      { id: 'sauna', label: 'Sauna' },
    ]
  },
  other_items: {
    title: 'Other Items',
    icon: Home,
    items: [
      { id: 'ceiling_fans', label: 'Ceiling Fans' },
      { id: 'exhaust_fans', label: 'Exhaust Fans' },
      { id: 'roof_attic_vents', label: 'Roof/Attic Vents' },
      { id: 'window_screens', label: 'Window Screens' },
      { id: 'washer_dryer_hookup', label: 'Washer/Dryer Hookup' },
      { id: 'fireplace_chimney', label: 'Fireplace & Chimney', hasType: true, typeOptions: ['wood', 'gas_logs', 'mock', 'other'], hasOtherSpecify: true },
      { id: 'solar_panels', label: 'Solar Panels', hasOwnership: true },
      { id: 'other_leased_items', label: 'Other Leased Item(s)', hasDescribe: true },
    ]
  }
};

const Section1PropertyItems = ({ data, onUpdate, onNestedUpdate }) => {
  const propertyItems = data.property_items || {};
  const waterSupply = data.water_supply || {};
  const roofInfo = data.roof_info || {};

  const updateItem = (itemId, field, value) => {
    const currentItem = propertyItems[itemId] || {};
    onNestedUpdate('section1', 'property_items', itemId, {
      ...currentItem,
      [field]: value
    });
  };

  const setItemValue = (itemId, value) => {
    const currentItem = propertyItems[itemId] || {};
    onNestedUpdate('section1', 'property_items', itemId, {
      ...currentItem,
      value
    });
  };

  const markGroupAsNo = (items) => {
    const updates = {};
    items.forEach(item => {
      updates[item.id] = { value: 'N' };
      if (item.subItems) {
        item.subItems.forEach(sub => {
          updates[sub.id] = { value: 'N' };
        });
      }
    });
    onUpdate('section1', 'property_items', { ...propertyItems, ...updates });
  };

  const renderItemRow = (item, indent = 0) => {
    const itemData = propertyItems[item.id] || {};
    const showConditional = itemData.value === 'Y';

    return (
      <div key={item.id}>
        <QuestionRow label={item.label} indent={indent} helpText={item.helpText}>
          <YNUSelector
            value={itemData.value}
            onChange={(v) => setItemValue(item.id, v)}
          />
        </QuestionRow>

        {/* Conditional fields based on item config */}
        {showConditional && (
          <ConditionalField show={true}>
            <div className="space-y-3">
              {/* Type selector */}
              {item.hasType && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Type:</span>
                  <RadioGroup
                    options={item.typeOptions.map(t => ({
                      value: t,
                      label: t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')
                    }))}
                    value={itemData.type}
                    onChange={(v) => updateItem(item.id, 'type', v)}
                  />
                </div>
              )}

              {/* Other specify */}
              {item.hasOtherSpecify && itemData.type === 'other' && (
                <TextInput
                  value={itemData.otherSpecify}
                  onChange={(v) => updateItem(item.id, 'otherSpecify', v)}
                  placeholder="Please specify..."
                  className="max-w-xs"
                />
              )}

              {/* Number of units */}
              {item.hasUnits && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Number of units:</span>
                  <NumberInput
                    value={itemData.units}
                    onChange={(v) => updateItem(item.id, 'units', v)}
                    min={1}
                  />
                </div>
              )}

              {/* Number of remotes (garage door openers) */}
              {item.hasRemotes && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Number of remotes:</span>
                  <NumberInput
                    value={itemData.remotes}
                    onChange={(v) => updateItem(item.id, 'remotes', v)}
                    min={0}
                  />
                </div>
              )}

              {/* Ownership */}
              {item.hasOwnership && (
                <div className="flex items-center gap-4 flex-wrap">
                  <RadioGroup
                    options={[
                      { value: 'owned', label: 'Owned' },
                      { value: 'leased', label: 'Leased from' }
                    ]}
                    value={itemData.ownership}
                    onChange={(v) => updateItem(item.id, 'ownership', v)}
                  />
                  {itemData.ownership === 'leased' && (
                    <TextInput
                      value={itemData.leasedFrom}
                      onChange={(v) => updateItem(item.id, 'leasedFrom', v)}
                      placeholder="Leased from..."
                      className="max-w-xs"
                    />
                  )}
                </div>
              )}

              {/* Attachment (carport/garage) */}
              {item.hasAttachment && (
                <RadioGroup
                  options={[
                    { value: 'attached', label: 'Attached' },
                    { value: 'not_attached', label: 'Not Attached' }
                  ]}
                  value={itemData.attachment}
                  onChange={(v) => updateItem(item.id, 'attachment', v)}
                />
              )}

              {/* Describe */}
              {item.hasDescribe && (
                <TextInput
                  value={itemData.describe}
                  onChange={(v) => updateItem(item.id, 'describe', v)}
                  placeholder="Please describe..."
                  className="max-w-md"
                />
              )}

              {/* Areas covered (sprinkler) */}
              {item.hasAreasCovered && (
                <TextInput
                  value={itemData.areasCovered}
                  onChange={(v) => updateItem(item.id, 'areasCovered', v)}
                  placeholder="Areas covered (e.g., front yard, backyard)..."
                  className="max-w-md"
                />
              )}
            </div>
          </ConditionalField>
        )}

        {/* Sub-items */}
        {item.hasSubItems && showConditional && (
          <div className="ml-6 border-l-2 border-gray-200 pl-4 mt-2">
            {item.subItems.map(sub => renderItemRow(sub, 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <SectionHeader
        number={1}
        title="Property Items"
        subtitle="Indicate which items are present in the property. This notice does not establish what items will convey - the contract will determine that."
      />

      <InfoBox type="info">
        For each item, select <strong>Y</strong> (Yes) if present, <strong>N</strong> (No) if not present,
        or <strong>U</strong> (Unknown) if you're unsure. Additional details may be requested for some items.
      </InfoBox>

      <div className="mt-6 space-y-4">
        {Object.entries(PROPERTY_ITEMS).map(([key, category]) => (
          <QuestionGroup
            key={key}
            title={category.title}
            icon={category.icon}
            onBulkAction={() => markGroupAsNo(category.items)}
            bulkActionLabel="None of these items are present"
          >
            {category.items.map(item => renderItemRow(item))}
          </QuestionGroup>
        ))}

        {/* Water Supply */}
        <QuestionGroup title="Water Supply" icon={Droplets}>
          <QuestionRow label="Water supply provided by">
            <RadioGroup
              options={[
                { value: 'city', label: 'City' },
                { value: 'well', label: 'Well' },
                { value: 'MUD', label: 'MUD' },
                { value: 'co-op', label: 'Co-op' },
                { value: 'unknown', label: 'Unknown' },
                { value: 'other', label: 'Other' }
              ]}
              value={waterSupply.provider}
              onChange={(v) => onNestedUpdate('section1', 'water_supply', 'provider', v)}
            />
          </QuestionRow>
          {waterSupply.provider === 'other' && (
            <ConditionalField show={true}>
              <TextInput
                value={waterSupply.other_specify}
                onChange={(v) => onNestedUpdate('section1', 'water_supply', 'other_specify', v)}
                placeholder="Please specify water provider..."
                className="max-w-md"
              />
            </ConditionalField>
          )}
        </QuestionGroup>

        {/* Roof Information */}
        <QuestionGroup title="Roof Information" icon={Home}>
          <QuestionRow label="Was the Property built before 1978?" required>
            <RadioGroup
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'unknown', label: 'Unknown' }
              ]}
              value={roofInfo.built_before_1978}
              onChange={(v) => onNestedUpdate('section1', 'roof_info', 'built_before_1978', v)}
            />
          </QuestionRow>
          {roofInfo.built_before_1978 === 'yes' && (
            <InfoBox type="warning">
              Because this property was built before 1978, you must also complete and attach the
              Lead-Based Paint Disclosure form (TXR-1906).
            </InfoBox>
          )}

          <QuestionRow label="Roof Type" required>
            <TextInput
              value={roofInfo.roof_type}
              onChange={(v) => onNestedUpdate('section1', 'roof_info', 'roof_type', v)}
              placeholder="e.g., Composition shingle, Metal, Tile..."
              className="w-64"
            />
          </QuestionRow>

          <QuestionRow label="Roof Age (approximate)" required>
            <TextInput
              value={roofInfo.roof_age}
              onChange={(v) => onNestedUpdate('section1', 'roof_info', 'roof_age', v)}
              placeholder="e.g., 5 years, Original (15 years)..."
              className="w-64"
            />
          </QuestionRow>

          <QuestionRow
            label="Is there an overlay roof covering?"
            helpText="An overlay is when new shingles are installed over existing shingles"
          >
            <RadioGroup
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'unknown', label: 'Unknown' }
              ]}
              value={roofInfo.overlay_roof}
              onChange={(v) => onNestedUpdate('section1', 'roof_info', 'overlay_roof', v)}
            />
          </QuestionRow>
        </QuestionGroup>

        {/* Section 1 Defects Question */}
        <QuestionGroup title="Items Condition" icon={PocketKnife}>
          <QuestionRow label="Are any of the above items not working, defective, or in need of repair?">
            <RadioGroup
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ]}
              value={roofInfo.items_have_defects}
              onChange={(v) => onNestedUpdate('section1', 'roof_info', 'items_have_defects', v)}
            />
          </QuestionRow>
          {roofInfo.items_have_defects === 'yes' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please describe the issues:
              </label>
              <TextArea
                value={data.defects_explanation}
                onChange={(v) => onUpdate('section1', 'defects_explanation', v)}
                placeholder="Describe which items have issues and the nature of the problems..."
                rows={4}
              />
            </div>
          )}
        </QuestionGroup>
      </div>
    </div>
  );
};

export default Section1PropertyItems;
