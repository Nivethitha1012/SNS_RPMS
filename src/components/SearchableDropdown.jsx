import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export function SearchableDropdown({ options, value, onChange, placeholder = "Select institution...", className = "", isMulti = false, showSearch = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleRemoveItem = (opt) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      let newValues = currentValues.filter(v => v !== opt);
      if (newValues.length === 0) newValues = ['All Institutions'];
      onChange(newValues);
    } else {
      onChange('');
    }
  };

  const renderDisplay = () => {
    if (isMulti) {
      if (!value || value.length === 0) return <span className="truncate pr-2">{placeholder}</span>;
      if (value.includes('All Institutions') && value.length === 1) return <span className="truncate pr-2">All Institutions</span>;
      
      return (
        <div className="flex items-center gap-2 pr-2 w-full overflow-hidden">
          <span className="truncate">{value[0]}</span>
          {value.length > 1 && (
            <span 
              className="flex items-center justify-center bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0"
              title={value.slice(1).join(', ')}
            >
              +{value.length - 1}
            </span>
          )}
        </div>
      );
    }
    return <span className="truncate pr-2">{value || placeholder}</span>;
  };

  const handleSelect = (opt) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      let newValues;
      
      if (opt === 'All Institutions') {
        newValues = ['All Institutions'];
      } else {
        if (currentValues.includes(opt)) {
          newValues = currentValues.filter(v => v !== opt);
          if (newValues.length === 0) newValues = ['All Institutions'];
        } else {
          newValues = [...currentValues.filter(v => v !== 'All Institutions'), opt];
        }
      }
      onChange(newValues);
      setIsOpen(false);
    } else {
      onChange(opt);
      // Auto-close on selection for single select
      setIsOpen(false);
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full h-9 bg-white border ${isOpen ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-300'} text-slate-700 text-xs font-semibold rounded-lg px-2 sm:px-3 outline-none shadow-sm transition-all hover:border-slate-400`}
      >
        <div className="flex-1 text-left flex items-center overflow-hidden min-w-0">
          {renderDisplay()}
        </div>
        <div className="flex items-center space-x-1 shrink-0 pl-1">
          {isMulti && value?.length > 0 && !(value.length === 1 && value[0] === 'All Institutions') && (
            <X 
              className="w-4 h-4 hover:text-red-500 cursor-pointer text-slate-400 transition-colors mr-1" 
              onClick={(e) => {
                e.stopPropagation();
                onChange(['All Institutions']);
              }} 
            />
          )}
          <ChevronDown strokeWidth={2.5} className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-72 min-w-full sm:min-w-0 bg-white border border-platinum-silver rounded-xl shadow-lg overflow-hidden origin-top animate-fade-in flex flex-col">
          
          {showSearch && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-700"
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">No results found.</div>
            ) : (
              filteredOptions.map((opt, i) => {
                const isSelected = isMulti ? (Array.isArray(value) && value.includes(opt)) : value === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors mb-0.5 last:mb-0 ${
                      isSelected 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-charcoal'
                    }`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
