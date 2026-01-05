import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for handling file uploads
 * @param {Object} options - Configuration options
 * @returns {Object} - Upload state and handlers
 */
export const useFileUpload = (options = {}) => {
  const {
    endpoint = '/uploads/image',
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    onSuccess = null,
    onError = null,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file) => {
    if (!file) {
      return 'No file selected';
    }

    if (file.size > maxSize) {
      return `File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return 'File type not allowed';
    }

    return null;
  }, [maxSize, allowedTypes]);

  /**
   * Upload a single file
   */
  const uploadFile = useCallback(async (file, additionalData = {}) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onError) onError(validationError);
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('image', file); // Some endpoints use 'image' field

      // Add any additional data
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      const result = response.data.image || response.data.document || response.data;

      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [endpoint, validateFile, onSuccess, onError]);

  /**
   * Upload multiple files
   */
  const uploadMultiple = useCallback(async (files, additionalData = {}) => {
    if (!files || files.length === 0) {
      setError('No files selected');
      return [];
    }

    // Validate all files first
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        if (onError) onError(validationError);
        return [];
      }
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const response = await api.post('/uploads/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      const result = response.data.files || [];

      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      return [];
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [validateFile, onSuccess, onError]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadFile,
    uploadMultiple,
    clearError,
    validateFile,
  };
};

/**
 * Hook specifically for image uploads
 */
export const useImageUpload = (options = {}) => {
  return useFileUpload({
    endpoint: '/uploads/image',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ...options,
  });
};

/**
 * Hook specifically for document uploads
 */
export const useDocumentUpload = (options = {}) => {
  return useFileUpload({
    endpoint: '/uploads/document',
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ],
    ...options,
  });
};

export default useFileUpload;
