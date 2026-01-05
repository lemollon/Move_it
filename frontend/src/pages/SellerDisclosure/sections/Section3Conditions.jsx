import React from 'react';
import { AlertCircle, Check, Bug, Droplets, Mountain, FileWarning } from 'lucide-react';
import {
  YesNoSelector, QuestionRow, QuestionGroup, TextArea, TextInput,
  InfoBox, SectionHeader, ConditionalField
} from '../components/FormComponents';

// Condition items organized by category
const CONDITION_CATEGORIES = {
  hazards: {
    title: 'Hazardous Materials & Conditions',
    icon: AlertCircle,
    items: [
      { id: 'aluminum_wiring', label: 'Aluminum Wiring' },
      { id: 'asbestos_components', label: 'Asbestos Components' },
      { id: 'hazardous_toxic_waste', label: 'Hazardous or Toxic Waste' },
      { id: 'lead_based_paint', label: 'Lead-Based Paint or Lead-Based Paint Hazards' },
      { id: 'radon_gas', label: 'Radon Gas' },
      { id: 'urea_formaldehyde_insulation', label: 'Urea-formaldehyde Insulation' },
      { id: 'previous_meth_manufacture', label: 'Previous Use of Premises for Manufacture of Methamphetamine' },
    ]
  },
  environmental: {
    title: 'Environmental Conditions',
    icon: Mountain,
    items: [
      { id: 'endangered_species_habitat', label: 'Endangered Species/Habitat on Property' },
      { id: 'fault_lines', label: 'Fault Lines' },
      { id: 'landfill', label: 'Landfill' },
      { id: 'wetlands', label: 'Wetlands on Property' },
      { id: 'underground_storage_tanks', label: 'Underground Storage Tanks' },
      { id: 'subsurface_structure_pits', label: 'Subsurface Structure or Pits' },
    ]
  },
  water_drainage: {
    title: 'Water & Drainage Issues',
    icon: Droplets,
    items: [
      { id: 'improper_drainage', label: 'Improper Drainage' },
      { id: 'intermittent_weather_springs', label: 'Intermittent or Weather Springs' },
      { id: 'water_damage_not_flood', label: 'Water Damage Not Due to a Flood Event' },
    ]
  },
  structural: {
    title: 'Structural History',
    icon: FileWarning,
    items: [
      { id: 'settling', label: 'Settling' },
      { id: 'soil_movement', label: 'Soil Movement' },
      { id: 'wood_rot', label: 'Wood Rot' },
      { id: 'previous_foundation_repairs', label: 'Previous Foundation Repairs' },
      { id: 'previous_roof_repairs', label: 'Previous Roof Repairs' },
      { id: 'previous_other_structural_repairs', label: 'Previous Other Structural Repairs' },
      { id: 'previous_fires', label: 'Previous Fires' },
    ]
  },
  pests: {
    title: 'Pest & Termite History',
    icon: Bug,
    items: [
      { id: 'termite_infestation_active', label: 'Active infestation of termites or other wood-destroying insects (WDI)' },
      { id: 'termite_treatment_previous', label: 'Previous treatment for termites or WDI' },
      { id: 'termite_damage_repaired', label: 'Previous termite or WDI damage repaired' },
      { id: 'termite_damage_needs_repair', label: 'Termite or WDI damage needing repair' },
    ]
  },
  trees: {
    title: 'Trees & Vegetation',
    icon: Mountain,
    items: [
      { id: 'diseased_trees', label: 'Diseased Trees', hasSubItems: true },
    ]
  },
  easements: {
    title: 'Easements & Encroachments',
    icon: FileWarning,
    items: [
      { id: 'encroachments_onto_property', label: 'Encroachments onto the Property' },
      { id: 'improvements_encroaching_others', label: "Improvements encroaching on others' property" },
      { id: 'unplatted_easements', label: 'Unplatted Easements' },
      { id: 'unrecorded_easements', label: 'Unrecorded Easements' },
    ]
  },
  historic: {
    title: 'Historic Designation',
    icon: FileWarning,
    items: [
      { id: 'historic_district', label: 'Located in Historic District' },
      { id: 'historic_property_designation', label: 'Historic Property Designation' },
    ]
  },
  pool_safety: {
    title: 'Pool Safety',
    icon: Droplets,
    items: [
      {
        id: 'single_blockable_drain',
        label: 'Single Blockable Main Drain in Pool/Hot Tub/Spa',
        helpText: 'A single blockable main drain may cause a suction entrapment hazard for an individual'
      },
    ]
  }
};

const Section3Conditions = ({ data, onUpdate, onNestedUpdate }) => {
  const conditions = data.conditions || {};

  const setCondition = (id, value) => {
    onNestedUpdate('section3', 'conditions', id, value);
  };

  const markCategoryAsNo = (items) => {
    const updates = { ...conditions };
    items.forEach(item => {
      updates[item.id] = false;
    });
    onUpdate('section3', 'conditions', updates);
  };

  const hasAnyYes = Object.values(conditions).some(v => v === true);
  const totalAnswered = Object.keys(conditions).filter(k => conditions[k] !== undefined).length;

  return (
    <div>
      <SectionHeader
        number={3}
        title="Awareness of Conditions"
        subtitle="Are you (Seller) aware of any of the following conditions?"
      />

      <InfoBox type="info">
        This section covers various conditions that may affect the property's value or safety.
        Answer honestly based on your knowledge - "Unknown" is not an option here, only Yes or No.
      </InfoBox>

      <div className="mt-6 space-y-4">
        {Object.entries(CONDITION_CATEGORIES).map(([key, category]) => (
          <QuestionGroup
            key={key}
            title={category.title}
            icon={category.icon}
            onBulkAction={() => markCategoryAsNo(category.items)}
            bulkActionLabel="None of these apply"
          >
            {category.items.map(item => (
              <div key={item.id}>
                <QuestionRow
                  label={item.label}
                  helpText={item.helpText}
                  highlight={conditions[item.id] === true}
                >
                  <YesNoSelector
                    value={conditions[item.id]}
                    onChange={(v) => setCondition(item.id, v)}
                  />
                </QuestionRow>

                {/* Diseased trees sub-items */}
                {item.id === 'diseased_trees' && conditions.diseased_trees === true && (
                  <ConditionalField show={true}>
                    <div className="space-y-3">
                      <QuestionRow label="Oak Wilt" indent={1}>
                        <YesNoSelector
                          value={conditions.diseased_trees_oak_wilt}
                          onChange={(v) => setCondition('diseased_trees_oak_wilt', v)}
                        />
                      </QuestionRow>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Other diseased trees:</span>
                        <TextInput
                          value={conditions.diseased_trees_other}
                          onChange={(v) => setCondition('diseased_trees_other', v)}
                          placeholder="Describe other diseased trees..."
                          className="flex-1 max-w-md"
                        />
                      </div>
                    </div>
                  </ConditionalField>
                )}
              </div>
            ))}
          </QuestionGroup>
        ))}

        {/* Explanation required if any Yes answers */}
        {hasAnyYes && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-yellow-800">Explanation Required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You indicated awareness of one or more conditions. Please provide details below.
                </p>
              </div>
            </div>
            <TextArea
              value={data.explanation}
              onChange={(v) => onUpdate('section3', 'explanation', v)}
              placeholder="Provide details about the conditions you indicated. Include when you became aware, any actions taken, and current status..."
              rows={5}
            />
          </div>
        )}

        {!hasAnyYes && totalAnswered > 10 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-700">
              No concerning conditions reported.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section3Conditions;
