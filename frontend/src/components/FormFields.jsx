// Form Input Component with Validation
// Reusable form field wrapper for React Hook Form

import React from 'react';

export const FormInput = React.forwardRef(
  ({ label, name, type = 'text', placeholder, error, required, disabled, className, help, ...props }, ref) => {
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={name}>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-input ${error ? 'input-error' : ''} ${className || ''}`}
          {...props}
        />
        {error && <span className="error-message">{error.message}</span>}
        {help && !error && <span className="help-text">{help}</span>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// Form Select Component
export const FormSelect = React.forwardRef(
  ({ label, name, options, placeholder, error, required, disabled, className, ...props }, ref) => {
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={name}>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={name}
          name={name}
          disabled={disabled}
          className={`form-input ${error ? 'input-error' : ''} ${className || ''}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="error-message">{error.message}</span>}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// Form Textarea Component
export const FormTextarea = React.forwardRef(
  ({ label, name, placeholder, error, required, disabled, rows = 4, className, ...props }, ref) => {
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={name}>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={name}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`form-input ${error ? 'input-error' : ''} ${className || ''}`}
          {...props}
        />
        {error && <span className="error-message">{error.message}</span>}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
