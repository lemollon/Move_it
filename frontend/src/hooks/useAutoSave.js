import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for auto-saving form data with debouncing
 * @param {Function} saveFn - The async function to call for saving
 * @param {number} delay - Debounce delay in milliseconds (default: 1500ms)
 * @returns {Object} - { isSaving, lastSaved, error, triggerSave }
 */
export const useAutoSave = (saveFn, delay = 1500) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const saveFnRef = useRef(saveFn);

  // Keep the saveFn reference up to date
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  // Debounced save function
  const triggerSave = useCallback((data) => {
    // Clear any pending save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      setError(null);

      try {
        await saveFnRef.current(data);
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save error:', err);
        setError(err.message || 'Failed to save');
      } finally {
        setIsSaving(false);
      }
    }, delay);
  }, [delay]);

  // Immediate save (bypasses debounce)
  const saveNow = useCallback(async (data) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveFnRef.current(data);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    error,
    triggerSave,
    saveNow
  };
};

/**
 * Format the last saved time for display
 * @param {Date} date - The date to format
 * @returns {string} - Formatted string like "Saved 2 minutes ago"
 */
export const formatLastSaved = (date) => {
  if (!date) return '';

  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 5) return 'Saved just now';
  if (diff < 60) return `Saved ${diff}s ago`;
  if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
  return `Saved at ${date.toLocaleTimeString()}`;
};

export default useAutoSave;
