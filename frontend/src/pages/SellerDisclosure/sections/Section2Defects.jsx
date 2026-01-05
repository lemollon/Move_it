import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import {
  YesNoSelector, QuestionRow, QuestionGroup, TextArea, InfoBox, SectionHeader
} from '../components/FormComponents';

// All defect categories
const DEFECT_ITEMS = [
  { id: 'basement', label: 'Basement' },
  { id: 'ceilings', label: 'Ceilings' },
  { id: 'doors', label: 'Doors' },
  { id: 'driveways', label: 'Driveways' },
  { id: 'electrical_systems', label: 'Electrical Systems' },
  { id: 'exterior_walls', label: 'Exterior Walls' },
  { id: 'floors', label: 'Floors' },
  { id: 'foundation_slab', label: 'Foundation / Slab(s)' },
  { id: 'interior_walls', label: 'Interior Walls' },
  { id: 'lighting_fixtures', label: 'Lighting Fixtures' },
  { id: 'plumbing_systems', label: 'Plumbing Systems' },
  { id: 'roof', label: 'Roof' },
  { id: 'sidewalks', label: 'Sidewalks' },
  { id: 'walls_fences', label: 'Walls / Fences' },
  { id: 'windows', label: 'Windows' },
  { id: 'other_structural', label: 'Other Structural Components' },
];

const Section2Defects = ({ data, onUpdate, onNestedUpdate }) => {
  const defects = data.defects || {};

  const setDefect = (id, value) => {
    onNestedUpdate('section2', 'defects', id, value);
  };

  const markAllAsNo = () => {
    const allNo = {};
    DEFECT_ITEMS.forEach(item => {
      allNo[item.id] = false;
    });
    onUpdate('section2', 'defects', allNo);
  };

  const hasAnyYes = Object.values(defects).some(v => v === true);

  return (
    <div>
      <SectionHeader
        number={2}
        title="Defects or Malfunctions"
        subtitle="Are you (Seller) aware of any defects or malfunctions in any of the following?"
      />

      <InfoBox type="info">
        Select <strong>Yes</strong> if you are aware of any current defects or malfunctions.
        If you answer Yes to any item, you'll need to provide an explanation at the end of this section.
      </InfoBox>

      <div className="mt-6">
        <QuestionGroup
          title="Structural Components"
          icon={AlertTriangle}
          onBulkAction={markAllAsNo}
          bulkActionLabel="No defects in any of these areas"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {DEFECT_ITEMS.map(item => (
              <QuestionRow
                key={item.id}
                label={item.label}
                highlight={defects[item.id] === true}
              >
                <YesNoSelector
                  value={defects[item.id]}
                  onChange={(v) => setDefect(item.id, v)}
                />
              </QuestionRow>
            ))}
          </div>
        </QuestionGroup>

        {/* Explanation required if any Yes answers */}
        {hasAnyYes && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-yellow-800">Explanation Required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You indicated defects in one or more areas. Please describe the defects below.
                </p>
              </div>
            </div>
            <TextArea
              value={data.explanation}
              onChange={(v) => onUpdate('section2', 'explanation', v)}
              placeholder="Describe the defects or malfunctions you are aware of. Include location, nature of the problem, and any repairs that have been made..."
              rows={5}
            />
          </div>
        )}

        {!hasAnyYes && Object.keys(defects).length > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-700">
              No defects or malfunctions reported in any structural components.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section2Defects;
