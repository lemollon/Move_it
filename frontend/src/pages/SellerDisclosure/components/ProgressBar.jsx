import React from 'react';
import { Check, Circle, Loader2, Clock } from 'lucide-react';
import { formatLastSaved } from '../../../hooks/useAutoSave';

/**
 * Section navigation with progress indicator
 */
export const SectionNav = ({ sections, currentSection, onSectionClick, sectionsSummary }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Sections
      </h3>
      <div className="space-y-1">
        {sections.map((section, index) => {
          const sectionNum = index + 1;
          const summary = sectionsSummary[`section${sectionNum}`];
          const isCompleted = summary?.completed;
          const isActive = currentSection === sectionNum;

          return (
            <button
              key={sectionNum}
              onClick={() => onSectionClick(sectionNum)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all
                ${isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'hover:bg-gray-50 text-gray-600'
                }
              `}
            >
              <span className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${isCompleted
                  ? 'bg-green-100 text-green-600'
                  : isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }
              `}>
                {isCompleted ? <Check size={14} /> : sectionNum}
              </span>
              <span className="text-sm truncate">{section.shortName || section.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Overall progress bar
 */
export const OverallProgress = ({ completion, isSaving, lastSaved, status }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Draft</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Completed</span>;
      case 'signed':
        return <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">Signed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-800">Progress</h3>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check size={14} className="text-green-500" />
              <span>{formatLastSaved(lastSaved)}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="relative">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <span className="absolute right-0 top-4 text-sm font-medium text-gray-600">
          {completion}% Complete
        </span>
      </div>

      {completion < 100 && (
        <p className="mt-4 text-sm text-gray-500">
          <Clock size={14} className="inline mr-1" />
          Estimated time remaining: ~{Math.ceil((100 - completion) / 10)} minutes
        </p>
      )}
    </div>
  );
};

/**
 * Mobile section stepper (horizontal scrolling on mobile)
 */
export const MobileStepper = ({ sections, currentSection, onSectionClick, sectionsSummary }) => {
  return (
    <div className="md:hidden overflow-x-auto pb-2 mb-4 -mx-4 px-4">
      <div className="flex gap-2 min-w-max">
        {sections.map((section, index) => {
          const sectionNum = index + 1;
          const summary = sectionsSummary[`section${sectionNum}`];
          const isCompleted = summary?.completed;
          const isActive = currentSection === sectionNum;

          return (
            <button
              key={sectionNum}
              onClick={() => onSectionClick(sectionNum)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-full text-sm whitespace-nowrap
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }
              `}
            >
              {isCompleted && !isActive ? (
                <Check size={14} />
              ) : (
                <span>{sectionNum}</span>
              )}
              <span>{section.shortName || section.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Navigation buttons (Previous / Next)
 */
export const NavigationButtons = ({
  currentSection,
  totalSections,
  onPrevious,
  onNext,
  onComplete,
  canComplete = false,
  isSaving = false
}) => {
  const isFirstSection = currentSection === 1;
  const isLastSection = currentSection === totalSections;

  return (
    <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstSection}
        className={`
          px-6 py-2 rounded-lg font-medium transition-colors
          ${isFirstSection
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        Previous
      </button>

      <div className="text-sm text-gray-500">
        Section {currentSection} of {totalSections}
      </div>

      {isLastSection ? (
        <button
          type="button"
          onClick={onComplete}
          disabled={!canComplete || isSaving}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${canComplete && !isSaving
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isSaving ? 'Saving...' : 'Complete & Sign'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Next Section
        </button>
      )}
    </div>
  );
};

export default {
  SectionNav,
  OverallProgress,
  MobileStepper,
  NavigationButtons
};
