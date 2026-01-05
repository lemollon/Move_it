import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Home, Building, Scale, DollarSign, Wrench,
  Camera, Calendar, FileCheck, Check, Circle, Loader2,
  ChevronDown, ChevronUp, MessageSquare, Sparkles
} from 'lucide-react';
import { disclosuresAPI } from '../../services/api';
import { useAutoSave, formatLastSaved } from '../../hooks/useAutoSave';

// Category definitions with their checklist items
const CATEGORIES = [
  {
    id: 'property_details',
    name: 'Property Details',
    icon: Home,
    color: 'blue',
    items: [
      { id: 'property_address', label: 'Property address & legal description verified' },
      { id: 'year_built', label: 'Year built confirmed' },
      { id: 'bedrooms_bathrooms', label: 'Bedrooms & bathrooms count verified' },
      { id: 'square_footage', label: 'Square footage measured/confirmed' },
      { id: 'lot_size', label: 'Lot size documented' },
      { id: 'property_type', label: 'Property type identified (single-family, condo, etc.)' },
      { id: 'parking_details', label: 'Parking details documented (garage, carport, spaces)' },
    ]
  },
  {
    id: 'hoa_info',
    name: 'HOA Information',
    icon: Building,
    color: 'purple',
    optional: true,
    items: [
      { id: 'hoa_name', label: 'HOA name and contact information' },
      { id: 'dues_coverage', label: 'Monthly/annual dues and what they cover' },
      { id: 'rental_restrictions', label: 'Rental restrictions reviewed' },
    ]
  },
  {
    id: 'ownership_legal',
    name: 'Ownership & Legal',
    icon: Scale,
    color: 'amber',
    items: [
      { id: 'clear_title', label: 'Clear title confirmed' },
      { id: 'mortgage_payoff', label: 'Mortgage payoff amount obtained' },
      { id: 'no_liens', label: 'No liens or judgments confirmed' },
      { id: 'taxes_current', label: 'Property taxes current' },
      { id: 'disclosures_ready', label: 'Required disclosures prepared' },
    ]
  },
  {
    id: 'pricing',
    name: 'Pricing Strategy',
    icon: DollarSign,
    color: 'green',
    items: [
      { id: 'market_value', label: 'Market value researched' },
      { id: 'comps_reviewed', label: 'Comparable sales reviewed' },
      { id: 'listing_price_set', label: 'Listing price determined' },
      { id: 'minimum_price', label: 'Minimum acceptable price decided' },
      { id: 'buyer_concessions', label: 'Buyer concessions policy decided' },
    ]
  },
  {
    id: 'property_condition',
    name: 'Property Condition',
    icon: Wrench,
    color: 'orange',
    items: [
      { id: 'roof_age', label: 'Roof age documented' },
      { id: 'hvac_age', label: 'HVAC system age documented' },
      { id: 'water_heater_age', label: 'Water heater age documented' },
      { id: 'repairs_upgrades', label: 'Recent repairs/upgrades listed' },
      { id: 'known_issues', label: 'Known issues disclosed' },
    ]
  },
  {
    id: 'photos_marketing',
    name: 'Photos & Marketing',
    icon: Camera,
    color: 'pink',
    items: [
      { id: 'professional_photos', label: 'Professional photos taken' },
      { id: 'virtual_tour', label: 'Video/virtual tour created (optional)' },
      { id: 'features_highlighted', label: 'Key features identified and highlighted' },
      { id: 'listing_description', label: 'Compelling listing description written' },
      { id: 'platforms_selected', label: 'Listing platforms selected' },
    ]
  },
  {
    id: 'showings',
    name: 'Showings Setup',
    icon: Calendar,
    color: 'cyan',
    items: [
      { id: 'showing_schedule', label: 'Showing schedule established' },
      { id: 'access_instructions', label: 'Access instructions prepared (lockbox, etc.)' },
      { id: 'occupancy_status', label: 'Occupancy status determined (occupied/vacant)' },
    ]
  },
  {
    id: 'offers_closing',
    name: 'Offers & Closing',
    icon: FileCheck,
    color: 'indigo',
    items: [
      { id: 'accepted_financing', label: 'Accepted financing types decided' },
      { id: 'ideal_closing_date', label: 'Ideal closing date range set' },
      { id: 'title_company', label: 'Title company selected or preferences noted' },
      { id: 'closing_costs', label: 'Estimated closing costs reviewed' },
      { id: 'buyer_faq', label: 'Common buyer questions anticipated' },
    ]
  },
];

const ChecklistItem = ({ item, checked, notes, onToggle, onNotesChange }) => {
  const [showNotes, setShowNotes] = useState(!!notes);

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={`
            mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
            ${checked
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
            }
          `}
        >
          {checked && <Check size={14} />}
        </button>
        <div className="flex-1">
          <span className={`text-sm ${checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
            {item.label}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1"
            >
              <MessageSquare size={12} />
              {notes ? 'Edit notes' : 'Add notes'}
            </button>
          </div>
          {showNotes && (
            <textarea
              value={notes || ''}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add notes..."
              rows={2}
              className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const CategoryCard = ({ category, data, onUpdate, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = category.icon;

  const categoryData = data || {};
  const completedCount = Object.values(categoryData).filter(item => item?.checked).length;
  const totalCount = category.items.length;
  const isComplete = completedCount === totalCount;

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  const handleItemToggle = (itemId) => {
    const currentItem = categoryData[itemId] || { checked: false, notes: '' };
    onUpdate(category.id, itemId, { ...currentItem, checked: !currentItem.checked });
  };

  const handleItemNotes = (itemId, notes) => {
    const currentItem = categoryData[itemId] || { checked: false, notes: '' };
    onUpdate(category.id, itemId, { ...currentItem, notes });
  };

  const markAllComplete = () => {
    category.items.forEach(item => {
      const currentItem = categoryData[item.id] || { checked: false, notes: '' };
      if (!currentItem.checked) {
        onUpdate(category.id, item.id, { ...currentItem, checked: true });
      }
    });
  };

  return (
    <div className={`bg-white rounded-xl border ${isComplete ? 'border-green-200' : 'border-gray-200'} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[category.color]}`}>
            <Icon size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              {category.name}
              {category.optional && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Optional</span>
              )}
            </h3>
            <p className="text-sm text-gray-500">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isComplete && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
              <Check size={12} /> Done
            </span>
          )}
          {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {!isComplete && (
            <button
              type="button"
              onClick={markAllComplete}
              className="mt-3 mb-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as complete
            </button>
          )}
          <div>
            {category.items.map(item => (
              <ChecklistItem
                key={item.id}
                item={item}
                checked={categoryData[item.id]?.checked || false}
                notes={categoryData[item.id]?.notes || ''}
                onToggle={() => handleItemToggle(item.id)}
                onNotesChange={(notes) => handleItemNotes(item.id, notes)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FSBOChecklist = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [hasHOA, setHasHOA] = useState(null);

  // Auto-save
  const saveFn = useCallback(async (data) => {
    if (!checklist?.id) return;
    const { categoryId, itemId, value } = data;
    await disclosuresAPI.autoSaveFSBOCategory(checklist.id, categoryId, {
      ...checklist[categoryId],
      [itemId]: value
    });
  }, [checklist]);

  const { isSaving, lastSaved, triggerSave } = useAutoSave(saveFn, 1000);

  // Load checklist
  useEffect(() => {
    const loadChecklist = async () => {
      try {
        const response = await disclosuresAPI.getFSBOChecklist(propertyId);
        setChecklist(response.data.checklist);
        setCompletion(response.data.completion);
        setHasHOA(response.data.checklist?.hoa_info?.has_hoa);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load checklist');
      } finally {
        setLoading(false);
      }
    };

    loadChecklist();
  }, [propertyId]);

  // Update handler
  const handleUpdate = (categoryId, itemId, value) => {
    setChecklist(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: value
      }
    }));

    // Trigger auto-save
    triggerSave({ categoryId, itemId, value });

    // Recalculate completion
    setTimeout(() => {
      const newCompletion = calculateCompletion();
      setCompletion(newCompletion);
    }, 0);
  };

  const calculateCompletion = () => {
    if (!checklist) return 0;

    let totalItems = 0;
    let checkedItems = 0;

    CATEGORIES.forEach(category => {
      // Skip HOA if not applicable
      if (category.id === 'hoa_info' && hasHOA === false) return;

      const categoryData = checklist[category.id] || {};
      category.items.forEach(item => {
        totalItems++;
        if (categoryData[item.id]?.checked) {
          checkedItems++;
        }
      });
    });

    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checklist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Checklist</h2>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">FSBO Listing Checklist</h1>
                <p className="text-sm text-gray-500">Prepare your property for sale</p>
              </div>
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
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Your Progress</h3>
            <span className="text-2xl font-bold text-blue-600">{completion}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completion === 100
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion === 100 && (
            <div className="mt-4 flex items-center gap-2 text-green-600">
              <Sparkles size={18} />
              <span className="font-medium">Checklist complete! You're ready to list.</span>
            </div>
          )}
        </div>

        {/* HOA Question */}
        {hasHOA === null && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
            <h3 className="font-medium text-purple-800 mb-2">Does this property have an HOA?</h3>
            <p className="text-sm text-purple-600 mb-4">
              This helps us customize your checklist.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setHasHOA(true);
                  handleUpdate('hoa_info', 'has_hoa', true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Yes, there's an HOA
              </button>
              <button
                onClick={() => {
                  setHasHOA(false);
                  handleUpdate('hoa_info', 'has_hoa', false);
                }}
                className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50"
              >
                No HOA
              </button>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-4">
          {CATEGORIES.map((category, index) => {
            // Skip HOA if not applicable
            if (category.id === 'hoa_info' && hasHOA === false) {
              return null;
            }

            return (
              <CategoryCard
                key={category.id}
                category={category}
                data={checklist?.[category.id]}
                onUpdate={handleUpdate}
                defaultOpen={index === 0}
              />
            );
          })}
        </div>

        {/* Next Steps */}
        {completion === 100 && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Ready for the next step?</h3>
            <p className="text-blue-100 mb-4">
              Your checklist is complete! Now you can create your listing or complete the
              required Seller's Disclosure form.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/seller')}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
              >
                Create Listing
              </button>
              <button
                onClick={() => propertyId && navigate(`/disclosure/${propertyId}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400"
              >
                Complete Disclosure
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FSBOChecklist;
