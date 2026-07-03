/**
 * components/common/Spinner.jsx
 *
 * Reusable loading spinner component.
 * Use for full-page loads, section loads, and button loading states.
 */

import React from 'react';

/**
 * @param {{ size?: 'sm'|'md'|'lg', label?: string, fullPage?: boolean }} props
 */
export function Spinner({ size = 'md', label = 'Loading...', fullPage = false }) {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size]} rounded-full border-slate-200 border-t-charcoal animate-spin`}
        role="status"
        aria-label={label}
      />
      {label && (
        <p className="text-xs font-semibold text-slate-400 animate-pulse">{label}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="w-full h-full min-h-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default Spinner;
