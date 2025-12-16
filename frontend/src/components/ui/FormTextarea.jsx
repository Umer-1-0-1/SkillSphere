import React from 'react';

const FormTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error,
  disabled = false,
  rows = 4,
  className = ''
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-[#999999]">
          {label} {required && <span className="text-[#94C705]">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-3 bg-[#161616] border-2 border-[#252525] rounded-2xl text-white placeholder-[#666666] focus:outline-none focus:border-[#94C705] transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormTextarea;
