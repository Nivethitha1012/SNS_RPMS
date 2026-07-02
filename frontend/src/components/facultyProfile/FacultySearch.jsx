import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

export function FacultySearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Collapse search bar on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        searchTerm === ''
      ) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [searchTerm]);

  // Focus input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(() => {
      onSearch(val);
    }, 400); // 400ms debounce
  };

  return (
    <div
      ref={searchContainerRef}
      className={`relative flex items-center h-10 transition-all duration-300 ease-out rounded-lg border shrink-0 ${isSearchExpanded
          ? 'w-64 sm:w-80 px-3 bg-white border-slate-300 shadow-xs'
          : 'w-10 px-0 bg-slate-50 border-slate-200 shadow-none hover:bg-slate-100 hover:border-slate-300'
        }`}
    >
      <button
        type="button"
        onClick={() => {
          if (!isSearchExpanded) {
            setIsSearchExpanded(true);
          }
        }}
        className={`flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${isSearchExpanded
            ? 'text-slate-400'
            : 'w-10 h-10 text-slate-500 hover:text-charcoal'
          }`}
        title="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search by name, ID, or department..."
        value={searchTerm}
        onChange={handleChange}
        className={`w-full text-xs pl-2 bg-transparent text-slate-900 border-none outline-none focus:ring-0 focus:outline-none transition-opacity duration-200 ${isSearchExpanded ? 'opacity-100 w-full pointer-events-auto' : 'opacity-0 w-0 pointer-events-none'
          }`}
      />
    </div>
  );
}
