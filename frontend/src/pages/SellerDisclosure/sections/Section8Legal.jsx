import React from 'react';
import { Scale, Building, Users, AlertTriangle, Check, Phone } from 'lucide-react';
import {
  YesNoSelector, QuestionRow, QuestionGroup, TextInput, TextArea, NumberInput,
  RadioGroup, InfoBox, SectionHeader, ConditionalField
} from '../components/FormComponents';

const LEGAL_CONDITIONS = [
  {
    id: 'unpermitted_work',
    label: 'Room additions or structural modifications without permits or not in compliance with building codes'
  },
  {
    id: 'deed_violations',
    label: 'Any notices of violations of deed restrictions or governmental ordinances'
  },
  {
    id: 'lawsuits',
    label: 'Any lawsuits or legal proceedings affecting the Property',
    helpText: 'Includes divorce, foreclosure, heirship, bankruptcy, or tax proceedings'
  },
  {
    id: 'deaths_on_property',
    label: 'Any death on Property except natural causes, suicide, or accident unrelated to Property condition'
  },
  {
    id: 'health_safety_conditions',
    label: 'Any condition materially affecting health or safety of an individual'
  },
  {
    id: 'environmental_remediation',
    label: 'Any repairs or treatments for environmental hazards (asbestos, radon, lead, urea-formaldehyde, mold)',
    helpText: 'If yes, attach certificates of repair/treatment'
  },
  {
    id: 'rainwater_harvesting',
    label: 'Any rainwater harvesting system over 500 gallons using public water as auxiliary source'
  },
  {
    id: 'propane_service_area',
    label: 'Property in propane gas system service area owned by propane distribution retailer'
  },
  {
    id: 'groundwater_district',
    label: 'Any portion in groundwater conservation district or subsidence district'
  },
];

const Section8Legal = ({ data, onUpdate, onNestedUpdate }) => {
  const conditions = data.conditions || {};
  const hoaDetails = data.hoa_details || {};
  const commonAreas = data.common_areas || {};

  const setCondition = (id, value) => {
    onNestedUpdate('section8', 'conditions', id, value);
  };

  const updateHOA = (field, value) => {
    onNestedUpdate('section8', 'hoa_details', field, value);
  };

  const updateCommonAreas = (field, value) => {
    onNestedUpdate('section8', 'common_areas', field, value);
  };

  const hasAnyYes = Object.values(conditions).some(v => v === true);

  return (
    <div>
      <SectionHeader
        number={8}
        title="Legal, HOA, and Property Conditions"
        subtitle="Legal status, HOA information, and special conditions"
      />

      <div className="mt-6 space-y-4">
        {/* HOA Section */}
        <QuestionGroup title="Homeowners Association (HOA)" icon={Building}>
          <QuestionRow label="Are there any homeowners' associations or maintenance fees/assessments?">
            <YesNoSelector
              value={conditions.hoa_exists}
              onChange={(v) => setCondition('hoa_exists', v)}
            />
          </QuestionRow>

          {conditions.hoa_exists === true && (
            <ConditionalField show={true}>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HOA Name
                    </label>
                    <TextInput
                      value={hoaDetails.name}
                      onChange={(v) => updateHOA('name', v)}
                      placeholder="Name of association..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manager's Name
                    </label>
                    <TextInput
                      value={hoaDetails.manager_name}
                      onChange={(v) => updateHOA('manager_name', v)}
                      placeholder="Property manager name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manager's Phone
                    </label>
                    <TextInput
                      value={hoaDetails.manager_phone}
                      onChange={(v) => updateHOA('manager_phone', v)}
                      placeholder="(xxx) xxx-xxxx"
                      icon={Phone}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fees/Assessments ($)
                    </label>
                    <NumberInput
                      value={hoaDetails.fees_amount}
                      onChange={(v) => updateHOA('fees_amount', v)}
                      min={0}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per (time period)
                    </label>
                    <TextInput
                      value={hoaDetails.fees_period}
                      onChange={(v) => updateHOA('fees_period', v)}
                      placeholder="e.g., month, quarter, year"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee Type
                    </label>
                    <RadioGroup
                      options={[
                        { value: 'mandatory', label: 'Mandatory' },
                        { value: 'voluntary', label: 'Voluntary' }
                      ]}
                      value={hoaDetails.fees_type}
                      onChange={(v) => updateHOA('fees_type', v)}
                    />
                  </div>
                </div>

                <QuestionRow label="Are there any unpaid HOA fees or assessments?">
                  <YesNoSelector
                    value={hoaDetails.unpaid_fees}
                    onChange={(v) => updateHOA('unpaid_fees', v)}
                  />
                </QuestionRow>

                {hoaDetails.unpaid_fees === true && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unpaid Amount ($)
                    </label>
                    <NumberInput
                      value={hoaDetails.unpaid_amount}
                      onChange={(v) => updateHOA('unpaid_amount', v)}
                      min={0}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional HOA Information (if multiple associations)
                  </label>
                  <TextArea
                    value={hoaDetails.multiple_info}
                    onChange={(v) => updateHOA('multiple_info', v)}
                    placeholder="Information about other associations if applicable..."
                    rows={3}
                  />
                </div>
              </div>
            </ConditionalField>
          )}
        </QuestionGroup>

        {/* Common Areas */}
        <QuestionGroup title="Common Areas" icon={Users}>
          <QuestionRow label="Are there any common areas co-owned in undivided interest?">
            <YesNoSelector
              value={conditions.common_areas}
              onChange={(v) => setCondition('common_areas', v)}
            />
          </QuestionRow>

          {conditions.common_areas === true && (
            <ConditionalField show={true}>
              <QuestionRow label="Are there optional user fees for common areas?">
                <YesNoSelector
                  value={commonAreas.user_fees}
                  onChange={(v) => updateCommonAreas('user_fees', v)}
                />
              </QuestionRow>

              {commonAreas.user_fees === true && (
                <div className="mt-3">
                  <TextArea
                    value={commonAreas.describe}
                    onChange={(v) => updateCommonAreas('describe', v)}
                    placeholder="Describe the user fees and what they cover..."
                    rows={3}
                  />
                </div>
              )}
            </ConditionalField>
          )}
        </QuestionGroup>

        {/* Legal Conditions */}
        <QuestionGroup title="Legal & Property Conditions" icon={Scale}>
          {LEGAL_CONDITIONS.map(item => (
            <QuestionRow
              key={item.id}
              label={item.label}
              helpText={item.helpText}
              highlight={conditions[item.id] === true}
            >
              <YesNoSelector
                value={conditions[item.id]}
                onChange={(v) => setCondition(item.id, v)}
              />
            </QuestionRow>
          ))}
        </QuestionGroup>

        {/* Explanation if any Yes */}
        {hasAnyYes && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-yellow-800">Explanation Required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You indicated Yes to one or more conditions. Please provide details below.
                </p>
              </div>
            </div>
            <TextArea
              value={data.explanation}
              onChange={(v) => onUpdate('section8', 'explanation', v)}
              placeholder="Provide details about the conditions indicated above..."
              rows={5}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Section8Legal;
