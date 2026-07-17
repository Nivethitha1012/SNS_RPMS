import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

const parseDateString = (str) => {
  if (!str) return null;
  const parts = str.split('.');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  return new Date(`${y}-${m}-${d}`);
};

const parseYYYYMMDD = (str) => {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(str);
};

const toYYYYMMDD = (date) => {
    if(!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
};

export const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate1, setCurrentDate1] = useState(new Date());
  const [currentDate2, setCurrentDate2] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)));
  
  const [tempStart, setTempStart] = useState(startDate ? parseYYYYMMDD(startDate) : null);
  const [tempEnd, setTempEnd] = useState(endDate ? parseYYYYMMDD(endDate) : null);
  const [hoverDate, setHoverDate] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTempStart(startDate ? parseYYYYMMDD(startDate) : null);
      setTempEnd(endDate ? parseYYYYMMDD(endDate) : null);
      if (startDate) {
        const d1 = parseYYYYMMDD(startDate);
        setCurrentDate1(new Date(d1.getFullYear(), d1.getMonth(), 1));
        setCurrentDate2(new Date(d1.getFullYear(), d1.getMonth() + 1, 1));
      }
    }
  }, [isOpen, startDate, endDate]);

  const handleDateClick = (date) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(date);
      setTempEnd(null);
    } else if (tempStart && !tempEnd) {
      if (date < tempStart) {
        setTempStart(date);
      } else {
        setTempEnd(date);
      }
    }
  };

  const isSelected = (date) => {
    if (tempStart && date.getTime() === tempStart.getTime()) return true;
    if (tempEnd && date.getTime() === tempEnd.getTime()) return true;
    return false;
  };

  const isInRange = (date) => {
    if (tempStart && tempEnd) {
      return date > tempStart && date < tempEnd;
    }
    if (tempStart && hoverDate && !tempEnd) {
      return (date > tempStart && date <= hoverDate) || (date < tempStart && date >= hoverDate);
    }
    return false;
  };

  const renderCalendar = (currentDate, setCurrentDate) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-7 w-7"></div>);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const selected = isSelected(date);
      const inRange = isInRange(date);
      
      days.push(
        <div key={i} className="relative h-7 w-7 flex items-center justify-center">
          {inRange && (
            <div className={`absolute h-7 inset-0 bg-emerald-50 ${date.getDay() === 0 ? 'rounded-l-lg' : ''} ${date.getDay() === 6 ? 'rounded-r-lg' : ''}`}></div>
          )}
          <button
            type="button"
            onClick={() => handleDateClick(date)}
            onMouseEnter={() => setHoverDate(date)}
            onMouseLeave={() => setHoverDate(null)}
            className={`relative z-10 h-6 w-6 rounded-full text-[11px] font-semibold flex items-center justify-center transition-all ${
              selected ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-700 hover:bg-emerald-100'
            }`}
          >
            {i}
          </button>
        </div>
      );
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
      <div className="flex flex-col w-57.5 p-3">
        <div className="flex justify-between items-center mb-4">
          <button 
            type="button"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center">
            <span className="font-extrabold text-slate-800 text-xs mr-1">{monthNames[month]}</span>
            <select
              value={year}
              onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}
              className="font-extrabold text-slate-800 text-xs bg-transparent border-none cursor-pointer outline-none hover:bg-slate-100 rounded p-0 text-center appearance-none"
            >
              {Array.from(
                { length: 26 }, 
                (_, i) => new Date().getFullYear() - 20 + i
              ).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button 
            type="button"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-y-1 mb-2">
          {DAYS.map(d => (
            <div key={d} className="h-7 w-7 flex items-center justify-center text-[9px] font-bold text-slate-400">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {days}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    onChange({
      startDate: tempStart ? toYYYYMMDD(tempStart) : '',
      endDate: tempEnd ? toYYYYMMDD(tempEnd) : ''
    });
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full justify-between shadow-sm transition-colors"
      >
        <span className="whitespace-nowrap truncate">
          {startDate || endDate 
            ? `${startDate ? formatDate(startDate) : '...'} - ${endDate ? formatDate(endDate) : '...'}` 
            : 'From - To'}
        </span>
        <CalendarIcon className="h-4 w-4 text-slate-400 ml-2" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-[9999] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in flex flex-col min-w-max"
        >
          <div className="flex flex-col md:flex-row justify-center items-center w-full divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {renderCalendar(currentDate1, setCurrentDate1)}
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Start date</label>
                <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1.5 w-27.5 shadow-sm">
                  <CalendarIcon className="h-3 w-3 text-slate-400 mr-2" />
                  <input 
                    type="text" 
                    readOnly 
                    value={tempStart ? formatDate(tempStart) : ''} 
                    placeholder="dd.mm.yyyy"
                    className="w-full text-[11px] font-semibold text-slate-700 border-none outline-none bg-transparent"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">End date</label>
                <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1.5 w-27.5 shadow-sm">
                  <CalendarIcon className="h-3 w-3 text-slate-400 mr-2" />
                  <input 
                    type="text" 
                    readOnly 
                    value={tempEnd ? formatDate(tempEnd) : ''} 
                    placeholder="dd.mm.yyyy"
                    className="w-full text-[11px] font-semibold text-slate-700 border-none outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleSave}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
            >
              Save dates
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
