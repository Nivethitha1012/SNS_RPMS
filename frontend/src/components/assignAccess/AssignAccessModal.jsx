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
  FileText
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
  const [showConstraintPrompt, setShowConstraintPrompt] = useState(null); // { feature, requiredPage }
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(type === 'revoked'); // If revoking, we just show success immediately for now.
      setSelectedPages([]);
      setSelectedFeatures([]);
      setShowConstraintPrompt(null);
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
      // Unchecking feature is fine
      setSelectedFeatures(prev => prev.filter(f => f !== feature.id));
    } else {
      // Checking a feature: does it have a required page that is NOT selected?
      if (!selectedPages.includes(feature.requiredPage)) {
        setShowConstraintPrompt({
          feature,
          requiredPage: PAGES.find(p => p.id === feature.requiredPage)
        });
      } else {
        setSelectedFeatures(prev => [...prev, feature.id]);
      }
    }
  };

  // Confirming the constraint prompt
  const confirmConstraint = () => {
    if (showConstraintPrompt) {
      setSelectedPages(prev => [...prev, showConstraintPrompt.requiredPage.id]);
      setSelectedFeatures(prev => [...prev, showConstraintPrompt.feature.id]);
      setShowConstraintPrompt(null);
    }
  };

  const cancelConstraint = () => {
    setShowConstraintPrompt(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
      <div className="w-full max-w-xl overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-2xl animate-scale-in my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 flex items-center justify-between text-left text-white bg-charcoal shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider">
                Assign Granular Access
              </h3>
              <p className="text-[11px] text-white/90 mt-0.5">
                Target: <span className="font-bold underline">{facultyUser.name}</span> ({facultyUser.department})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 relative">
          
          {showConstraintPrompt && (
            <div className="absolute top-4 left-6 right-6 bg-white border-2 border-charcoal p-4 rounded-xl shadow-2xl z-10 animate-fade-in text-left">
              <div className="flex space-x-3">
                <AlertCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-charcoal tracking-wide uppercase">Page Access Required</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    The <strong className="font-bold text-slate-800">{showConstraintPrompt.feature.label}</strong> feature requires access to the <strong className="font-bold text-slate-800">{showConstraintPrompt.requiredPage.label}</strong> page. Do you want to automatically check this page and proceed?
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <button onClick={confirmConstraint} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm">
                      Yes, grant both
                    </button>
                    <button onClick={cancelConstraint} className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`transition-opacity duration-300 ${showConstraintPrompt ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <p className="text-sm text-slate-600 mb-6 text-left">
              Select the specific pages and features you want to grant to this faculty member. Checking a feature will enforce required page access.
            </p>

            {/* Pages Section */}
            <div className="mb-6">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center space-x-2 text-left">
                <FileText className="h-3.5 w-3.5" />
                <span>Pages Access</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAGES.map(page => (
                  <label key={page.id} className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${selectedPages.includes(page.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      checked={selectedPages.includes(page.id)}
                      onChange={() => handleTogglePage(page.id)}
                    />
                    <span className={`text-sm font-semibold ${selectedPages.includes(page.id) ? 'text-emerald-900' : 'text-slate-700'}`}>
                      {page.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features Section */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center space-x-2 text-left">
                <Lock className="h-3.5 w-3.5" />
                <span>Specific Features</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURES.map(feature => (
                  <label key={feature.id} className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${selectedFeatures.includes(feature.id) ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => handleToggleFeature(feature)}
                    />
                    <div className="flex flex-col text-left">
                      <span className={`text-sm font-semibold ${selectedFeatures.includes(feature.id) ? 'text-blue-900' : 'text-slate-700'}`}>
                        {feature.label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Requires: {PAGES.find(p => p.id === feature.requiredPage)?.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleConfirmGrants}
            disabled={!!showConstraintPrompt || (selectedPages.length === 0 && selectedFeatures.length === 0)}
            className="px-5 py-2 text-sm font-bold text-white bg-charcoal border border-transparent rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm & Assign
          </button>
        </div>
        
      </div>
    </div>
  );
}
