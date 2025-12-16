import React from 'react';

const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  required = false,
  error,
  disabled = false,
  placeholder = 'Select an option',
  className = ''
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-[#999999]">
          {label} {required && <span className="text-[#94C705]">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-[#161616] border-2 border-[#252525] rounded-2xl text-white focus:outline-none focus:border-[#94C705] transition-colors disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px'
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option 
            key={index} 
            value={option.value}
            className="bg-[#161616] text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;
