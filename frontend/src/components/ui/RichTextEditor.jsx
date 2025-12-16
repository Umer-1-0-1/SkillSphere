import React from 'react';

const RichTextEditor = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error,
  disabled = false,
  className = ''
}) => {
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isList, setIsList] = React.useState(false);
  const editorRef = React.useRef(null);

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    const content = editorRef.current?.innerHTML || '';
    onChange({ target: { name, value: content } });
    
    // Update button states
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsList(document.queryCommandState('insertUnorderedList'));
  };

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const toolbarButtonClass = (active) => 
    `p-2 rounded hover:bg-[#252525] transition-colors ${active ? 'bg-[#252525] text-[#94C705]' : 'text-[#999999]'}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[#999999]">
          {label} {required && <span className="text-[#94C705]">*</span>}
        </label>
      )}
      <div className={`bg-[#161616] border-2 border-[#252525] rounded-2xl overflow-hidden ${disabled ? 'opacity-50' : ''} ${className}`}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-[#252525]">
          <button
            type="button"
            onClick={() => handleFormat('bold')}
            className={toolbarButtonClass(isBold)}
            disabled={disabled}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleFormat('italic')}
            className={toolbarButtonClass(isItalic)}
            disabled={disabled}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M14 20h4M15 4L9 20" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleFormat('underline')}
            className={toolbarButtonClass(false)}
            disabled={disabled}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4v8a6 6 0 0012 0V4M4 20h16" />
            </svg>
          </button>
          <div className="w-px h-6 bg-[#252525] mx-1"></div>
          <button
            type="button"
            onClick={() => handleFormat('insertUnorderedList')}
            className={toolbarButtonClass(isList)}
            disabled={disabled}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleFormat('insertOrderedList')}
            className={toolbarButtonClass(false)}
            disabled={disabled}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </button>
          <div className="w-px h-6 bg-[#252525] mx-1"></div>
          <button
            type="button"
            onClick={() => handleFormat('createLink', prompt('Enter URL:'))}
            className={toolbarButtonClass(false)}
            disabled={disabled}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
        </div>
        
        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          className="min-h-[150px] p-4 text-white focus:outline-none overflow-y-auto"
          style={{ maxHeight: '300px' }}
          data-placeholder={placeholder}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #666666;
          pointer-events: none;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          padding-left: 24px;
          margin: 8px 0;
        }
        [contenteditable] a {
          color: #94C705;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
