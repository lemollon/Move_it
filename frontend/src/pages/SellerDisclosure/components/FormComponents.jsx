import React, { useState } from 'react';
import { Check, X, HelpCircle, ChevronDown, ChevronUp, Info, AlertCircle } from 'lucide-react';

/**
 * Yes/No/Unknown selector component
 */
export const YNUSelector = ({ value, onChange, disabled = false, showUnknown = true }) => {
  const options = [
    { value: 'Y', label: 'Yes', color: 'green' },
    { value: 'N', label: 'No', color: 'red' },
    ...(showUnknown ? [{ value: 'U', label: 'Unknown', color: 'gray' }] : [])
  ];

  return (
    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`
            px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium transition-all
            flex-1 sm:flex-none min-w-[70px] touch-manipulation
            ${value === opt.value
              ? opt.color === 'green'
                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                : opt.color === 'red'
                  ? 'bg-red-100 text-red-700 border-2 border-red-500'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-500'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Yes/No boolean selector
 */
export const YesNoSelector = ({ value, onChange, disabled = false }) => {
  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`
          px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
          flex-1 sm:flex-none min-w-[80px] touch-manipulation
          ${value === true
            ? 'bg-green-100 text-green-700 border-2 border-green-500'
            : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 active:bg-gray-100'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Check size={16} /> Yes
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`
          px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
          flex-1 sm:flex-none min-w-[80px] touch-manipulation
          ${value === false
            ? 'bg-red-100 text-red-700 border-2 border-red-500'
            : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 active:bg-gray-100'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <X size={16} /> No
      </button>
    </div>
  );
};

/**
 * Radio group for selecting one option
 */
export const RadioGroup = ({ options, value, onChange, disabled = false, inline = true }) => {
  return (
    <div className={`flex ${inline ? 'flex-wrap gap-3' : 'flex-col gap-2'}`}>
      {options.map(opt => (
        <label
          key={opt.value}
          className={`
            flex items-center gap-2 cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="radio"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
};

/**
 * Checkbox group for multi-select
 */
export const CheckboxGroup = ({ options, values = [], onChange, disabled = false }) => {
  const handleToggle = (optValue) => {
    if (values.includes(optValue)) {
      onChange(values.filter(v => v !== optValue));
    } else {
      onChange([...values, optValue]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {options.map(opt => (
        <label
          key={opt.value}
          className={`
            flex items-center gap-2 cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="checkbox"
            checked={values.includes(opt.value)}
            onChange={() => handleToggle(opt.value)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
};

/**
 * Question row with label and input
 */
export const QuestionRow = ({
  label,
  children,
  required = false,
  helpText = null,
  indent = 0,
  highlight = false
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div
      className={`
        py-3 border-b border-gray-100 last:border-0
        ${highlight ? 'bg-yellow-50 -mx-4 px-4' : ''}
      `}
      style={{ paddingLeft: indent * 24 }}
    >
      {/* Stack vertically on mobile, horizontal on larger screens */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-700 leading-relaxed">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
            {helpText && (
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-gray-400 hover:text-blue-500 transition-colors p-1 -m-1 touch-manipulation"
              >
                <HelpCircle size={18} />
              </button>
            )}
          </div>
          {showHelp && helpText && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              {helpText}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Collapsible question group
 */
export const QuestionGroup = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge = null,
  onBulkAction = null,
  bulkActionLabel = "None of these apply"
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {Icon && <Icon size={20} className="text-blue-600 flex-shrink-0" />}
          <span className="font-medium text-gray-800 text-sm sm:text-base truncate">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0">
              {badge}
            </span>
          )}
        </div>
        <div className="flex-shrink-0 ml-2">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 sm:p-4">
          {onBulkAction && (
            <button
              type="button"
              onClick={onBulkAction}
              className="mb-4 w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center sm:justify-start gap-2 touch-manipulation"
            >
              <Check size={16} />
              {bulkActionLabel}
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Text input with optional icon
 */
export const TextInput = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  icon: Icon = null,
  disabled = false,
  maxLength = null,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      )}
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`
          w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg
          text-base sm:text-sm
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${Icon ? 'pl-10' : ''}
        `}
      />
    </div>
  );
};

/**
 * Textarea with character count
 */
export const TextArea = ({
  value,
  onChange,
  placeholder = '',
  rows = 3,
  maxLength = 2000,
  disabled = false,
  showCount = true
}) => {
  const charCount = (value || '').length;

  return (
    <div className="relative">
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg resize-none
          text-base sm:text-sm
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
        `}
      />
      {showCount && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1">
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  );
};

/**
 * Number input with optional min/max
 */
export const NumberInput = ({
  value,
  onChange,
  min = 0,
  max = null,
  placeholder = '',
  disabled = false,
  className = ''
}) => {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      min={min}
      max={max}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-24 px-3 py-2 border border-gray-300 rounded-lg text-center
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
    />
  );
};

/**
 * Info box for additional context
 */
export const InfoBox = ({ children, type = 'info' }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700'
  };

  const icons = {
    info: Info,
    warning: AlertCircle,
    error: AlertCircle,
    success: Check
  };

  const IconComponent = icons[type];

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} flex gap-3`}>
      <IconComponent size={20} className="flex-shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  );
};

/**
 * Section header
 */
export const SectionHeader = ({ number, title, subtitle = null }) => {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-start sm:items-center gap-3 mb-2">
        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
          {number}
        </span>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 leading-tight">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-sm text-gray-500 ml-11">{subtitle}</p>
      )}
    </div>
  );
};

/**
 * Conditional field wrapper - shows children only when condition is met
 */
export const ConditionalField = ({ show, children }) => {
  if (!show) return null;

  return (
    <div className="mt-3 ml-6 pl-4 border-l-2 border-blue-200">
      {children}
    </div>
  );
};

export default {
  YNUSelector,
  YesNoSelector,
  RadioGroup,
  CheckboxGroup,
  QuestionRow,
  QuestionGroup,
  TextInput,
  TextArea,
  NumberInput,
  InfoBox,
  SectionHeader,
  ConditionalField
};
