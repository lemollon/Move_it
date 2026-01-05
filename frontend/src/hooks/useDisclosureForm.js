import { useState, useCallback, useEffect } from 'react';
import { disclosuresAPI } from '../services/api';
import { useAutoSave } from './useAutoSave';

/**
 * Custom hook for managing Seller Disclosure form state
 * @param {string} propertyId - The property ID to load disclosure for
 * @returns {Object} - Form state and handlers
 */
export const useDisclosureForm = (propertyId) => {
  const [disclosure, setDisclosure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [completion, setCompletion] = useState(0);
  const [sectionsSummary, setSectionsSummary] = useState({});

  // Section data state
  const [sectionData, setSectionData] = useState({});

  // Auto-save function
  const saveSection = useCallback(async (data) => {
    if (!disclosure?.id) return;

    const response = await disclosuresAPI.autoSaveSection(
      disclosure.id,
      currentSection.toString(),
      data
    );

    setCompletion(response.data.completion);
    return response.data;
  }, [disclosure?.id, currentSection]);

  const { isSaving, lastSaved, error: saveError, triggerSave, saveNow } = useAutoSave(saveSection);

  // Load disclosure data
  const loadDisclosure = useCallback(async () => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);

    try {
      // Try to get existing or create new
      const response = await disclosuresAPI.createOrGet(propertyId);
      const { disclosure: data, completion: comp, sectionsSummary: summary } = response.data;

      setDisclosure(data);
      setCompletion(comp);
      setSectionsSummary(summary);
      setCurrentSection(data.current_section || 1);

      // Initialize section data from loaded disclosure
      setSectionData({
        header: data.header_data || {},
        section1: {
          property_items: data.section1_property_items || {},
          water_supply: data.section1_water_supply || {},
          roof_info: data.section1_roof_info || {},
          defects_explanation: data.section1_defects_explanation || ''
        },
        section2: {
          defects: data.section2_defects || {},
          explanation: data.section2_explanation || ''
        },
        section3: {
          conditions: data.section3_conditions || {},
          explanation: data.section3_explanation || ''
        },
        section4: {
          additional_repairs: data.section4_additional_repairs,
          explanation: data.section4_explanation || ''
        },
        section5: {
          flood_data: data.section5_flood_data || {},
          explanation: data.section5_explanation || ''
        },
        section6: {
          flood_claim: data.section6_flood_claim,
          explanation: data.section6_explanation || ''
        },
        section7: {
          fema_assistance: data.section7_fema_assistance,
          explanation: data.section7_explanation || ''
        },
        section8: {
          conditions: data.section8_conditions || {},
          hoa_details: data.section8_hoa_details || {},
          common_areas: data.section8_common_areas || {},
          explanation: data.section8_explanation || ''
        },
        section9: {
          has_reports: data.section9_has_reports,
          reports: data.section9_reports || []
        },
        section10: {
          exemptions: data.section10_exemptions || []
        },
        section11: {
          insurance_claims: data.section11_insurance_claims
        },
        section12: {
          unremediated_claims: data.section12_unremediated_claims,
          explanation: data.section12_explanation || ''
        },
        section13: {
          smoke_detectors: data.section13_smoke_detectors,
          explanation: data.section13_explanation || ''
        },
        utilities: data.utility_providers || {},
        signatures: {
          seller1: data.seller1_signature,
          seller2: data.seller2_signature
        }
      });
    } catch (err) {
      console.error('Load disclosure error:', err);
      setError(err.response?.data?.message || 'Failed to load disclosure');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  // Initial load
  useEffect(() => {
    loadDisclosure();
  }, [loadDisclosure]);

  // Update section data and trigger auto-save
  const updateSectionData = useCallback((section, field, value) => {
    setSectionData(prev => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };

      // Map section data to API format for auto-save
      const apiData = mapSectionToApi(section, newData[section]);
      triggerSave(apiData);

      return newData;
    });
  }, [triggerSave]);

  // Update nested field
  const updateNestedField = useCallback((section, parentField, field, value) => {
    setSectionData(prev => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [parentField]: {
            ...prev[section]?.[parentField],
            [field]: value
          }
        }
      };

      const apiData = mapSectionToApi(section, newData[section]);
      triggerSave(apiData);

      return newData;
    });
  }, [triggerSave]);

  // Bulk update (for "None apply" type actions)
  const bulkUpdateSection = useCallback((section, updates) => {
    setSectionData(prev => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          ...updates
        }
      };

      const apiData = mapSectionToApi(section, newData[section]);
      triggerSave(apiData);

      return newData;
    });
  }, [triggerSave]);

  // Navigate to section
  const goToSection = useCallback((sectionNum) => {
    setCurrentSection(sectionNum);
  }, []);

  // Complete disclosure
  const completeDisclosure = useCallback(async () => {
    if (!disclosure?.id) return;

    try {
      await disclosuresAPI.complete(disclosure.id);
      await loadDisclosure(); // Reload to get updated status
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to complete disclosure');
    }
  }, [disclosure?.id, loadDisclosure]);

  // Sign disclosure
  const signDisclosure = useCallback(async (signatureData, sellerNumber = 1) => {
    if (!disclosure?.id) return;

    try {
      await disclosuresAPI.signSeller(disclosure.id, {
        ...signatureData,
        seller_number: sellerNumber
      });
      await loadDisclosure();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to sign disclosure');
    }
  }, [disclosure?.id, loadDisclosure]);

  return {
    // State
    disclosure,
    loading,
    error: error || saveError,
    currentSection,
    completion,
    sectionsSummary,
    sectionData,
    isSaving,
    lastSaved,

    // Actions
    updateSectionData,
    updateNestedField,
    bulkUpdateSection,
    goToSection,
    completeDisclosure,
    signDisclosure,
    saveNow,
    reload: loadDisclosure
  };
};

// Helper to map section data to API format
const mapSectionToApi = (section, data) => {
  const mapping = {
    header: { header_data: data },
    section1: {
      section1_property_items: data.property_items,
      section1_water_supply: data.water_supply,
      section1_roof_info: data.roof_info,
      section1_defects_explanation: data.defects_explanation
    },
    section2: {
      section2_defects: data.defects,
      section2_explanation: data.explanation
    },
    section3: {
      section3_conditions: data.conditions,
      section3_explanation: data.explanation
    },
    section4: {
      section4_additional_repairs: data.additional_repairs,
      section4_explanation: data.explanation
    },
    section5: {
      section5_flood_data: data.flood_data,
      section5_explanation: data.explanation
    },
    section6: {
      section6_flood_claim: data.flood_claim,
      section6_explanation: data.explanation
    },
    section7: {
      section7_fema_assistance: data.fema_assistance,
      section7_explanation: data.explanation
    },
    section8: {
      section8_conditions: data.conditions,
      section8_hoa_details: data.hoa_details,
      section8_common_areas: data.common_areas,
      section8_explanation: data.explanation
    },
    section9: {
      section9_has_reports: data.has_reports,
      section9_reports: data.reports
    },
    section10: {
      section10_exemptions: data.exemptions
    },
    section11: {
      section11_insurance_claims: data.insurance_claims
    },
    section12: {
      section12_unremediated_claims: data.unremediated_claims,
      section12_explanation: data.explanation
    },
    section13: {
      section13_smoke_detectors: data.smoke_detectors,
      section13_explanation: data.explanation
    },
    utilities: { utility_providers: data },
    signatures: {
      seller1_signature: data.seller1,
      seller2_signature: data.seller2
    }
  };

  return mapping[section] || data;
};

export default useDisclosureForm;
