import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { useDisclosureForm } from '../../hooks/useDisclosureForm';
import { SectionNav, OverallProgress, MobileStepper, NavigationButtons } from './components/ProgressBar';

// Import all sections
import Section1PropertyItems from './sections/Section1PropertyItems';
import Section2Defects from './sections/Section2Defects';
import Section3Conditions from './sections/Section3Conditions';
import Section4Repairs from './sections/Section4Repairs';
import Section5Flood from './sections/Section5Flood';
import Section6FloodClaims from './sections/Section6FloodClaims';
import Section7FEMA from './sections/Section7FEMA';
import Section8Legal from './sections/Section8Legal';
import Section9Inspections from './sections/Section9Inspections';
import Section10Taxes from './sections/Section10Taxes';
import Section11Insurance from './sections/Section11Insurance';
import Section12Unremediated from './sections/Section12Unremediated';
import Section13SmokeDetectors from './sections/Section13SmokeDetectors';
import SectionUtilities from './sections/SectionUtilities';
import SectionSignatures from './sections/SectionSignatures';

// Section definitions
const SECTIONS = [
  { id: 1, name: 'Property Items', shortName: 'Items', component: Section1PropertyItems },
  { id: 2, name: 'Defects/Malfunctions', shortName: 'Defects', component: Section2Defects },
  { id: 3, name: 'Conditions', shortName: 'Conditions', component: Section3Conditions },
  { id: 4, name: 'Additional Repairs', shortName: 'Repairs', component: Section4Repairs },
  { id: 5, name: 'Flood Conditions', shortName: 'Flood', component: Section5Flood },
  { id: 6, name: 'Flood Claims', shortName: 'Claims', component: Section6FloodClaims },
  { id: 7, name: 'FEMA/SBA', shortName: 'FEMA', component: Section7FEMA },
  { id: 8, name: 'Legal/HOA', shortName: 'Legal', component: Section8Legal },
  { id: 9, name: 'Inspections', shortName: 'Inspections', component: Section9Inspections },
  { id: 10, name: 'Tax Exemptions', shortName: 'Taxes', component: Section10Taxes },
  { id: 11, name: 'Insurance', shortName: 'Insurance', component: Section11Insurance },
  { id: 12, name: 'Unremediated', shortName: 'Unremediated', component: Section12Unremediated },
  { id: 13, name: 'Smoke Detectors', shortName: 'Smoke', component: Section13SmokeDetectors },
  { id: 14, name: 'Utilities', shortName: 'Utilities', component: SectionUtilities },
  { id: 15, name: 'Signatures', shortName: 'Sign', component: SectionSignatures },
];

const SellerDisclosure = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const {
    disclosure,
    loading,
    error,
    currentSection,
    completion,
    sectionsSummary,
    sectionData,
    isSaving,
    lastSaved,
    updateSectionData,
    updateNestedField,
    bulkUpdateSection,
    goToSection,
    completeDisclosure,
    signDisclosure,
  } = useDisclosureForm(propertyId);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  const handlePrevious = () => {
    if (currentSection > 1) {
      goToSection(currentSection - 1);
    }
  };

  const handleNext = () => {
    if (currentSection < SECTIONS.length) {
      goToSection(currentSection + 1);
    }
  };

  const handleComplete = async () => {
    try {
      await completeDisclosure();
      // Navigate to signatures
      goToSection(15);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading disclosure form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Disclosure</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get the current section component
  const CurrentSectionComponent = SECTIONS[currentSection - 1]?.component;
  const sectionKey = `section${currentSection}`;

  // Determine which data to pass based on section
  const getSectionData = () => {
    switch (currentSection) {
      case 14:
        return sectionData.utilities;
      case 15:
        return sectionData.signatures;
      default:
        return sectionData[sectionKey] || {};
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Seller's Disclosure Notice</h1>
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {disclosure?.header_data?.property_address || 'Property Disclosure'}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${disclosure?.status === 'signed'
                  ? 'bg-purple-100 text-purple-700'
                  : disclosure?.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }
              `}>
                {disclosure?.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Stepper */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
        <MobileStepper
          sections={SECTIONS}
          currentSection={currentSection}
          onSectionClick={goToSection}
          sectionsSummary={sectionsSummary}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <OverallProgress
                completion={completion}
                isSaving={isSaving}
                lastSaved={lastSaved}
                status={disclosure?.status}
              />
              <SectionNav
                sections={SECTIONS}
                currentSection={currentSection}
                onSectionClick={goToSection}
                sectionsSummary={sectionsSummary}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Progress bar on mobile */}
            <div className="md:hidden mb-6">
              <OverallProgress
                completion={completion}
                isSaving={isSaving}
                lastSaved={lastSaved}
                status={disclosure?.status}
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              {CurrentSectionComponent && (
                currentSection === 15 ? (
                  <SectionSignatures
                    data={getSectionData()}
                    onSign={signDisclosure}
                    disclosure={disclosure}
                    completion={completion}
                  />
                ) : currentSection === 14 ? (
                  <SectionUtilities
                    data={getSectionData()}
                    onUpdate={(section, field, value) => {
                      if (section === 'utilities') {
                        updateNestedField('utilities', field, 'data', value);
                      }
                    }}
                  />
                ) : (
                  <CurrentSectionComponent
                    data={getSectionData()}
                    onUpdate={updateSectionData}
                    onNestedUpdate={updateNestedField}
                    onBulkUpdate={bulkUpdateSection}
                  />
                )
              )}

              <NavigationButtons
                currentSection={currentSection}
                totalSections={SECTIONS.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onComplete={handleComplete}
                canComplete={completion >= 80}
                isSaving={isSaving}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SellerDisclosure;
