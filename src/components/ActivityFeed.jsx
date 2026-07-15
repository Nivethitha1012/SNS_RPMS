/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getAbsolutePdfUrl } from '../api/apiClient';
import { 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Download, 
  UploadCloud, 
  Trash2 
} from 'lucide-react';

export function TempAdminDashboard({
  publications,
  currentUser,
  onApprove,
  onReject,
  onSelectReview,
  selectedPubIdForReview,
}) {
  const [errorMsg, setErrorMsg] = useState('');
  const [reviewFile, setReviewFile] = useState(null);

  // Filter publications based on temporary admin access policy
  const assignedPubs = publications.filter(p => {
    if (currentUser.tempAdminAccessType === 'full') {
      return p.authorId !== currentUser.id && (p.status === 'Submitted' || p.assignedReviewerId === currentUser.id);
    }
    return p.assignedReviewerId === currentUser.id;
  });

  // Compute metrics specifically for assigned publications
  const pendingCount = assignedPubs.filter(p => p.status === 'Submitted').length;
  const completedCount = assignedPubs.filter(p => p.status === 'Completed').length;
  const totalCount = assignedPubs.length;

  const activePub = publications.find(p => p.id === selectedPubIdForReview);

  const handleApproveAction = () => {
    if (!activePub) return;
    setErrorMsg('');
    if (!reviewFile) {
      setErrorMsg('Please upload a reviewed/annotated document to proceed.');
      return;
    }
    onApprove(activePub.id, reviewFile);
    setReviewFile(null);
    onSelectReview(null);
  };

  if (activePub) {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        {/* Navigation back header */}
        <div className="flex justify-between items-center bg-pure-white p-4 rounded-2xl border border-platinum-silver silver-glow flex-wrap gap-3">
          <button
            onClick={() => {
              setFeedback('');
              setErrorMsg('');
              onSelectReview(null);
            }}
            className="px-4 py-2 text-xs font-semibold text-charcoal bg-frost-gray hover:bg-mist-silver rounded-xl flex items-center space-x-2 transition-all cursor-pointer border border-platinum-silver font-sans"
          >
            <ArrowLeft className="h-4 w-4 text-steel-gray" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-semibold font-sans bg-ice-gray text-charcoal px-3 py-1 rounded-xl border border-platinum-silver hidden sm:inline-block">
              Review ID: {activePub.id}
            </span>
          </div>
        </div>

        {/* Review Vertical Stacked Layout */}
        <div className="flex flex-col gap-6 text-left">
          
          {/* BOTTOM COLUMN: REVIEWS META AND INPUT PANEL */}
          <div className="bg-pure-white p-6 rounded-2xl border border-platinum-silver shadow-sm space-y-6">
            
            {/* Scholar Information row */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-slate-gray tracking-wider font-sans">
                Scholar Details
              </h3>
              <div className="bg-ice-gray border border-platinum-silver p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-charcoal text-sm">{activePub.author}</h4>
                  <p className="text-[11px] text-slate-gray font-medium">{activePub.department}</p>
                  <p className="text-[10px] text-slate-gray font-mono mt-1">
                    {activePub.email || 'N/A'}
                  </p>
                </div>
                <div className="h-10 w-10 bg-frost-gray text-charcoal border border-platinum-silver rounded-full flex items-center justify-center font-bold text-lg">
                  {activePub.author.charAt(0)}
                </div>
              </div>
            </div>

            {/* Publication Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-slate-gray tracking-wider font-sans">
                Publication Details
              </h3>
              <div className="border border-platinum-silver rounded-xl p-4 bg-slate-50/20 space-y-4">
                <div className="text-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-gray font-semibold block mb-0.5 text-center">Title</span>
                  <p className="text-sm font-bold text-charcoal leading-snug text-center">{activePub.title}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-normal">
                  <div className="border border-platinum-silver/60 p-3 rounded-lg bg-pure-white shadow-3xs flex items-center justify-between col-span-2 flex-wrap gap-2">
                    <div>
                      <span className="text-slate-gray block font-semibold text-[9px] uppercase">Manuscript File</span>
                      <span className="font-mono font-bold text-charcoal truncate block max-w-50">Manuscript PDF</span>
                    </div>
                    {activePub.manuscriptUrl ? (
                      <a
                        href={getAbsolutePdfUrl(activePub.manuscriptUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-frost-gray hover:bg-mist-silver border border-platinum-silver rounded-lg text-charcoal flex items-center justify-center cursor-pointer transition-colors"
                        title="Download Manuscript"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No file</span>
                    )}
                  </div>
                </div>

                {/* Submission Date */}
                <div className="border-t border-platinum-silver/60 pt-3">
                  <span className="text-slate-gray block font-semibold text-[9px] uppercase mb-2">Submission Date</span>
                  <div className="bg-pure-white p-3 rounded-lg border border-platinum-silver/45 flex flex-col justify-center text-left">
                    <span className="font-bold text-charcoal text-xs">{activePub.submissionDate ? new Date(activePub.submissionDate).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>



            {/* Audit Input Form */}
            <div className="space-y-3">
              {/* File Upload for Reviewed/Annotated Document */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase text-charcoal font-sans">
                    Upload Reviewed/Annotated Document <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-gray font-medium">Compulsory for evaluation submission</span>
                </div>
                {!reviewFile ? (
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center relative cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setReviewFile(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-slate-500 transition-colors mb-1.5" />
                    <span className="text-xs font-semibold text-slate-700">Click to choose or drag file</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Supports PDF or Word up to 100 MB</span>
                  </div>
                ) : (
                  <div className="border border-slate-200 bg-emerald-50/20 rounded-xl p-3 flex items-center justify-between shadow-xs animate-fade-in">
                    <div className="flex items-center space-x-2.5 truncate">
                      <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div className="truncate text-left">
                        <p className="text-xs font-bold text-slate-800 truncate">{reviewFile.name}</p>
                        <p className="text-[10px] text-emerald-700 font-semibold font-mono">Annotated file attached</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewFile(null)}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg hover:text-red-700 transition-all cursor-pointer shrink-0"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200/50 rounded-xl p-3 text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleApproveAction}
                  className="flex-1 py-2.5 text-xs font-semibold text-charcoal bg-frost-gray hover:bg-mist-silver border border-platinum-silver rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 text-steel-gray" />
                  <span>Approve</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

   // Primary Workspace Panel view
  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Banner / Header */}
      <div className="bg-pure-white border border-platinum-silver p-6 rounded-2xl shadow-xs flex flex-col justify-between items-start md:flex-row md:items-center relative overflow-hidden transition-all duration-300 hover:scale-[1.005] hover:shadow-md">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-5 pointer-events-none select-none">
          <ShieldCheck className="h-48 w-48 text-charcoal" />
        </div>
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl font-semibold text-charcoal font-sans">
            Evaluation Console
          </h2>
          <p className="text-xs text-slate-gray">
            Review manuscripts assigned to your profile by the Office of Dean (Research).
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-frost-gray border border-platinum-silver px-3.5 py-1.5 rounded-xl text-center">
          <span className="text-[10px] font-bold text-charcoal uppercase block">Assessor Profile</span>
          <span className="text-[11px] font-semibold text-charcoal">{currentUser.name}</span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-pure-white p-4 rounded-2xl border border-platinum-silver silver-glow flex flex-col justify-between text-left shadow-xs transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-platinum-silver/80">
          <span className="text-[10px] uppercase font-semibold text-slate-gray">Assigned</span>
          <span className="text-2xl font-bold font-mono text-charcoal mt-1">{totalCount}</span>
        </div>
        
        <div className="bg-pure-white p-4 rounded-2xl border border-platinum-silver silver-glow flex flex-col justify-between text-left shadow-xs transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-platinum-silver/80">
          <span className="text-[10px] uppercase font-semibold text-charcoal">Pending</span>
          <span className="text-2xl font-bold font-mono text-charcoal mt-1">{pendingCount}</span>
        </div>

        <div className="bg-pure-white p-4 rounded-2xl border border-platinum-silver silver-glow flex flex-col justify-between text-left shadow-xs transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-platinum-silver/80">
          <span className="text-[10px] uppercase font-semibold text-charcoal">Completed</span>
          <span className="text-2xl font-bold font-mono text-charcoal mt-1">{completedCount}</span>
        </div>
      </div>

      {/* Ledger Workspace Table */}
      <div className="bg-pure-white rounded-2xl border border-platinum-silver silver-glow overflow-hidden shadow-xs transition-all duration-300 hover:scale-[1.005] hover:shadow-md">
        <div className="p-5 border-b border-platinum-silver bg-ice-gray flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-charcoal text-sm font-sans">
              Assigned Publications ({assignedPubs.length})
            </h4>
            <p className="text-[11px] text-slate-gray">
              Only manuscripts assigned to your account are displayed.
            </p>
          </div>
        </div>

        {assignedPubs.length === 0 ? (
          <div className="p-16 text-center text-slate-gray italic text-xs font-semibold">
            No publications assigned to your account.
          </div>
        ) : (
          <div className="w-full">
            {/* Mobile/Tablet view card list */}
            <div className="lg:hidden space-y-4 p-4 divide-y divide-platinum-silver">
              {assignedPubs.map((pub) => (
                <div key={pub.id} className="pt-4 first:pt-0 space-y-2 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-400 block">{pub.id}</span>
                      <span className="font-bold text-charcoal text-xs block mt-0.5">{pub.author}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black font-mono border ${
                      pub.status === 'Completed' ? 'bg-frost-gray text-charcoal border-platinum-silver' :
                      'bg-ice-gray text-charcoal border-platinum-silver'
                    }`}>
                      {pub.status}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 block text-xs leading-snug truncate" title={pub.title}>{pub.title}</span>
                  <div className="flex justify-between items-center text-[10px] text-slate-gray border-t border-slate-100 pt-2 font-medium">
                    <div>
                      <p>Date: {pub.submissionDate ? new Date(pub.submissionDate).toLocaleDateString() : 'N/A'}</p>
                      <p>Version: <span className="font-mono font-bold text-slate-700" title={`Version ${pub.currentVersion}`}>V{pub.currentVersion}</span></p>
                    </div>
                    <button
                      onClick={() => onSelectReview(pub.id)}
                      className="px-3.5 py-1.5 bg-frost-gray hover:bg-mist-silver border border-platinum-silver text-charcoal text-[11px] font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Eye className="h-3 w-3 text-steel-gray" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop view table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="bg-ice-gray text-slate-gray uppercase tracking-wider font-semibold text-[9px] border-b border-platinum-silver">
                    <th className="p-4 text-center font-sans font-medium">
                      <div className="flex flex-col items-center">
                        <span>Publication</span>
                        <span>ID</span>
                      </div>
                    </th>
                    <th className="p-4 font-sans font-medium">Faculty</th>
                    <th className="p-4 font-sans font-medium">Department</th>
                    <th className="p-4 text-center font-sans font-medium">Title</th>
                    <th className="p-4 text-center font-sans font-medium">
                      <div className="flex flex-col items-center">
                        <span>Uploaded</span>
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="p-4 text-center font-sans font-medium">
                      <div className="flex flex-col items-center">
                        <span>Reviewed</span>
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="p-4 text-center font-sans font-medium">Status</th>
                    <th className="p-4 text-center font-sans font-medium">Version</th>
                    <th className="p-4 text-center font-sans font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-platinum-silver text-slate-gray text-left">
                  {assignedPubs.map((pub) => (
                    <tr key={pub.id} className="hover:bg-ice-gray/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-gray text-center">
                        {pub.id}
                      </td>
                      <td className="p-4 font-semibold text-charcoal text-left">
                        {pub.author}
                      </td>
                      <td className="p-4 font-sans text-slate-gray text-left">
                        {pub.department}
                      </td>
                      <td className="p-4 max-w-xs truncate font-bold text-charcoal text-left" title={pub.title}>
                        {pub.title}
                      </td>
                      <td className="p-4 text-slate-gray text-center font-sans font-medium">
                        {new Date(pub.submissionDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-gray text-center font-sans font-medium">
                        {pub.status === 'Submitted' ? '-' : new Date(pub.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black font-mono border ${
                          pub.status === 'Completed' ? 'bg-frost-gray text-charcoal border-platinum-silver' :
                          pub.status === 'Submitted' ? 'bg-ice-gray text-charcoal border-platinum-silver' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {pub.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-1.5 py-0.5 bg-frost-gray border border-platinum-silver text-charcoal font-bold rounded text-[10px] font-mono inline-block" title={`Version ${pub.currentVersion}`}>
                          V{pub.currentVersion}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onSelectReview(pub.id)}
                          className="px-3.5 py-1.5 bg-frost-gray hover:bg-mist-silver border border-platinum-silver text-charcoal text-[11px] font-semibold rounded flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95 mx-auto"
                        >
                          <Eye className="h-3 w-3 text-steel-gray" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
