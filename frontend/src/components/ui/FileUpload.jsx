import React from 'react';

const FileUpload = ({ 
  label, 
  name, 
  onChange, 
  accept,
  required = false,
  error,
  disabled = false,
  maxSize, // in MB
  helperText,
  currentFile,
  className = ''
}) => {
  const [fileName, setFileName] = React.useState('');
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }
      setFileName(file.name);
      onChange(e);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }
      setFileName(file.name);
      // Create a synthetic event
      const event = {
        target: {
          files: [file],
          name: name
        }
      };
      onChange(event);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[#999999]">
          {label} {required && <span className="text-[#94C705]">*</span>}
        </label>
      )}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive 
            ? 'border-[#94C705] bg-[#94C705]/10' 
            : 'border-[#252525] hover:border-[#94C705]/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          id={name}
          name={name}
          onChange={handleChange}
          accept={accept}
          required={required}
          disabled={disabled}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <svg className="w-12 h-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {fileName || currentFile ? (
            <p className="text-white">{fileName || currentFile}</p>
          ) : (
            <>
              <p className="text-white">
                <span className="text-[#94C705]">Click to upload</span> or drag and drop
              </p>
              {helperText && (
                <p className="text-sm text-[#666666]">{helperText}</p>
              )}
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
