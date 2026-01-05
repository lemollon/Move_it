import React from 'react';
import { ClipboardList, Plus, Trash2, AlertTriangle, Check, Calendar, User, FileText } from 'lucide-react';
import {
  YesNoSelector, TextInput, NumberInput, InfoBox, SectionHeader
} from '../components/FormComponents';

const Section9Inspections = ({ data, onUpdate }) => {
  const reports = data.reports || [];

  const addReport = () => {
    onUpdate('section9', 'reports', [
      ...reports,
      { inspection_date: '', inspection_type: '', inspector_name: '', report_pages: null }
    ]);
  };

  const updateReport = (index, field, value) => {
    const newReports = [...reports];
    newReports[index] = { ...newReports[index], [field]: value };
    onUpdate('section9', 'reports', newReports);
  };

  const removeReport = (index) => {
    onUpdate('section9', 'reports', reports.filter((_, i) => i !== index));
  };

  return (
    <div>
      <SectionHeader
        number={9}
        title="Previous Inspection Reports"
        subtitle="Information about property inspections in the last 4 years"
      />

      <InfoBox type="warning">
        <strong>Important:</strong> Buyer should not rely on old inspection reports.
        Buyer is encouraged to obtain new inspections to assess the current condition of the property.
      </InfoBox>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ClipboardList className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-2">
              Within the last 4 years, have you received any written inspection reports
              concerning this property?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This includes home inspections, termite inspections, structural reports, etc.
            </p>

            <YesNoSelector
              value={data.has_reports}
              onChange={(v) => {
                onUpdate('section9', 'has_reports', v);
                if (v === true && reports.length === 0) {
                  addReport();
                }
              }}
            />
          </div>
        </div>

        {data.has_reports === true && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Inspection Reports</h4>
              <button
                type="button"
                onClick={addReport}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                Add Report
              </button>
            </div>

            <div className="space-y-4">
              {reports.map((report, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 relative"
                >
                  {reports.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReport(index)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <Calendar size={14} />
                        Inspection Date
                      </label>
                      <input
                        type="date"
                        value={report.inspection_date || ''}
                        onChange={(e) => updateReport(index, 'inspection_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FileText size={14} />
                        Type of Inspection
                      </label>
                      <TextInput
                        value={report.inspection_type}
                        onChange={(v) => updateReport(index, 'inspection_type', v)}
                        placeholder="e.g., Home, Termite, Structural..."
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <User size={14} />
                        Inspector Name
                      </label>
                      <TextInput
                        value={report.inspector_name}
                        onChange={(v) => updateReport(index, 'inspector_name', v)}
                        placeholder="Name of inspector or company..."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Number of Pages
                      </label>
                      <NumberInput
                        value={report.report_pages}
                        onChange={(v) => updateReport(index, 'report_pages', v)}
                        min={1}
                        placeholder="# pages"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <InfoBox type="info">
              If you have copies of these reports, you should provide them to the buyer
              or make them available for review upon request.
            </InfoBox>
          </div>
        )}

        {data.has_reports === false && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-700">
              No inspection reports have been received in the last 4 years.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section9Inspections;
