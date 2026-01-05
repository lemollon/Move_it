import React, { useState, useRef } from 'react';
import {
  Paperclip, Upload, X, FileText, File, Image,
  Loader2, AlertCircle, Check, Download, Trash2
} from 'lucide-react';
import { useDocumentUpload } from '../../../hooks/useFileUpload';

const ATTACHMENT_TYPES = [
  { id: 'inspection_report', label: 'Inspection Report', icon: FileText },
  { id: 'hoa_document', label: 'HOA Document', icon: FileText },
  { id: 'survey', label: 'Survey', icon: Image },
  { id: 'title_document', label: 'Title Document', icon: FileText },
  { id: 'warranty', label: 'Warranty', icon: File },
  { id: 'permit', label: 'Permit', icon: FileText },
  { id: 'other', label: 'Other', icon: File },
];

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const AttachmentCard = ({ attachment, onRemove, isRemoving }) => {
  const typeInfo = ATTACHMENT_TYPES.find(t => t.id === attachment.type) || ATTACHMENT_TYPES[6];
  const Icon = typeInfo.icon;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <Icon size={20} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{attachment.name}</p>
        <p className="text-xs text-gray-500">
          {typeInfo.label} • {formatFileSize(attachment.size)} • {formatDate(attachment.uploaded_at)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {attachment.url && (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Download size={16} />
          </a>
        )}
        <button
          onClick={() => onRemove(attachment.id)}
          disabled={isRemoving}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  );
};

const AttachmentUploader = ({ onUpload, isUploading, progress = 0, disclosureId }) => {
  const [selectedType, setSelectedType] = useState('inspection_report');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const { uploadFile, uploading: hookUploading, progress: hookProgress, error } = useDocumentUpload();

  const handleFileSelect = async (files) => {
    if (files.length === 0) return;

    const file = files[0];

    // Upload to server (Cloudinary or local)
    const result = await uploadFile(file, {
      document_type: selectedType,
      folder: 'disclosures',
    });

    if (result) {
      // Build attachment data from upload result
      const attachment = {
        name: file.name,
        type: selectedType,
        size: file.size,
        url: result.url,
        publicId: result.publicId,
      };

      await onUpload(attachment);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const currentlyUploading = isUploading || hookUploading;
  const currentProgress = hookProgress || progress;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Document Type:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {ATTACHMENT_TYPES.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${currentlyUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={currentlyUploading}
        />

        {currentlyUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">
              Uploading...{currentProgress > 0 && ` ${currentProgress}%`}
            </p>
            {currentProgress > 0 && (
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-gray-400" />
            <p className="text-sm text-gray-600">
              <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const Attachments = ({
  attachments = [],
  onAdd,
  onRemove,
  maxAttachments = 20,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (attachmentData) => {
    if (attachments.length >= maxAttachments) {
      setError(`Maximum ${maxAttachments} attachments allowed`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await onAdd(attachmentData);
    } catch (err) {
      setError(err.message || 'Failed to upload attachment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (attachmentId) => {
    setRemovingId(attachmentId);
    setError(null);

    try {
      await onRemove(attachmentId);
    } catch (err) {
      setError(err.message || 'Failed to remove attachment');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Paperclip size={20} className="text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Attachments</h3>
          <p className="text-sm text-gray-500">
            Upload inspection reports, HOA documents, surveys, etc.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Existing attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2 mb-4">
          {attachments.map(attachment => (
            <AttachmentCard
              key={attachment.id}
              attachment={attachment}
              onRemove={handleRemove}
              isRemoving={removingId === attachment.id}
            />
          ))}
        </div>
      )}

      {/* Upload area */}
      {!disabled && attachments.length < maxAttachments && (
        <AttachmentUploader
          onUpload={handleUpload}
          isUploading={isUploading}
        />
      )}

      {/* Count indicator */}
      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
        <span>{attachments.length} of {maxAttachments} attachments</span>
        {attachments.length > 0 && (
          <span className="flex items-center gap-1 text-green-600">
            <Check size={14} />
            All documents saved
          </span>
        )}
      </div>
    </div>
  );
};

export default Attachments;
