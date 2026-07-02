/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  FileText,
  Check
} from 'lucide-react';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'queue', label: 'Submissions Queue' },
  { id: 'evaluation', label: 'Evaluation Console' },
  { id: 'upload', label: 'Upload Manuscript' },
  { id: 'publications', label: 'My Publications' },
  { id: 'assign_access', label: 'Assign Access' },
];

const FEATURES = [
  { id: 'evaluate_manuscript', label: 'Evaluate Manuscript', requiredPage: 'evaluation' },
  { id: 'delete_manuscript', label: 'Delete Manuscript', requiredPage: 'queue' },
  { id: 'export_data', label: 'Export Data', requiredPage: 'dashboard' },
  { id: 'manage_users', label: 'Manage Users', requiredPage: 'assign_access' },
];

export function GrantAssessorModal({
  isOpen,
  onClose,
  facultyUser,
  type, // 'granted' (meaning opening selection) or 'revoked'
  onConfirmGrant,
}) {
  const [selectedPages, setSelectedPages] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(type === 'revoked'); // If revoking, we just show success immediately for now.
      setSelectedPages([]);
      setSelectedFeatures([]);
    }
  }, [isOpen, type]);

  if (!isOpen || !facultyUser) return null;

  // Handle toggling a page
  const handleTogglePage = (pageId) => {
    setSelectedPages(prev => {
      if (prev.includes(pageId)) {
        // If unchecking a page, we should also uncheck features that depend on it
        const dependingFeatures = FEATURES.filter(f => f.requiredPage === pageId).map(f => f.id);
        setSelectedFeatures(fPrev => fPrev.filter(fId => !dependingFeatures.includes(fId)));
        return prev.filter(p => p !== pageId);
      } else {
        return [...prev, pageId];
      }
    });
  };

  // Handle toggling a feature
  const handleToggleFeature = (feature) => {
    if (selectedFeatures.includes(feature.id)) {
      setSelectedFeatures(prev => prev.filter(f => f !== feature.id));
    } else {
      if (!selectedPages.includes(feature.requiredPage)) {
        setSelectedPages(prev => [...prev, feature.requiredPage]);
      }
      setSelectedFeatures(prev => [...prev, feature.id]);
    }
  };

  const handleConfirmGrants = () => {
    // Pass the selected permissions back to the parent
    if (onConfirmGrant) {
      onConfirmGrant(facultyUser.id, { pages: selectedPages, features: selectedFeatures });
    }
    setIsSuccess(true);
  };

  if (isSuccess) {
    const isGranted = type === 'granted';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
        <div className="w-full max-w-md overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-2xl animate-scale-in my-8">
          <div className={`p-5 flex items-center justify-between text-left text-white ${isGranted ? 'bg-emerald-600' : 'bg-red-650'}`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                {isGranted ? <ShieldCheck className="h-5 w-5 text-white" /> : <AlertCircle className="h-5 w-5 text-white" />}
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  {isGranted ? 'Access Granted' : 'Access Revoked'}
                </h3>
                <p className="text-[11px] text-white/90 mt-0.5">
                  Faculty Member: <span className="font-bold underline">{facultyUser.name}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <div className="p-6 space-y-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className={`p-3 rounded-full ${isGranted ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {isGranted ? <CheckCircle2 className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
              </div>
              <h4 className={`text-base font-extrabold ${isGranted ? 'text-emerald-700' : 'text-red-700'}`}>
                {isGranted ? 'Custom Privileges Applied' : 'Assessor Access Disabled'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                {isGranted ? (
                  <>Custom evaluation privileges have been successfully granted to <span className="font-bold text-slate-800">{facultyUser.name}</span>.</>
                ) : (
                  <>Evaluation privileges for <span className="font-bold text-slate-800">{facultyUser.name}</span> have been revoked.</>
                )}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
              <button onClick={onClose} className={`w-full max-w-xs py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer ${isGranted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-visible relative z-10 animate-scale-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-800">Assign Granular Access</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          
          <div>
            
            <p className="text-sm text-slate-500 mb-4">Select the pages and features to grant to <span className="font-bold">{facultyUser.name}</span>:</p>

            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-visible p-4 space-y-4 text-left">
              {/* Pages Section */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-0.5">
                  Pages Access
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                  {PAGES.map(page => (
                    <label key={page.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0"
                        checked={selectedPages.includes(page.id)}
                        onChange={() => handleTogglePage(page.id)}
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900 leading-tight">
                        {page.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Features Section */}
              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-0.5">
                  Specific Features
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                  {FEATURES.map(feature => (
                    <label key={feature.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0"
                        checked={selectedFeatures.includes(feature.id)}
                        onChange={() => handleToggleFeature(feature)}
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900 leading-tight">
                        {feature.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleConfirmGrants}
            disabled={selectedPages.length === 0 && selectedFeatures.length === 0}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 flex items-center space-x-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            <span>Confirm & Assign</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}
