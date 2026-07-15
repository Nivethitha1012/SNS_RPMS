/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, FileText, CheckCircle2, AlertCircle, ArrowLeft, Download, UploadCloud, Trash2, Loader2 } from 'lucide-react';
import { downloadFromUrl } from '../services/uploadService';
import config from '../config';

export function AdminReviews({
  publications,
  onApprove,
  selectedPubId,
  onSelectPub,
  hideSensitiveInfo = false,
}) {
  const [errorMsg, setErrorMsg] = useState('');
  const [reviewFile, setReviewFile] = useState(null);
  const [activeView, setActiveView] = useState({ type: null, url: null }); // type: 'manuscript' | 'review' | null
  const [viewLoading, setViewLoading] = useState(null); // 'manuscript' | 'review' | null

  // Revoke blob URL when component unmounts to free memory
  useEffect(() => () => { if (activeView.url) URL.revokeObjectURL(activeView.url); }, [activeView.url]);

  // handleView reuses the exact same fetch+auth logic as downloadFromUrl,
  // but instead of triggering a download it creates a blob: URL for the iframe.
  const handleView = async (url, type) => {
    if (activeView.type === type) {
      // Already showing this type — toggle off and free memory
      if (activeView.url) URL.revokeObjectURL(activeView.url);
      setActiveView({ type: null, url: null });
      return;
    }

    // If switching to a different view, revoke the old one to free memory
    if (activeView.url) URL.revokeObjectURL(activeView.url);

    setViewLoading(type);
    try {
      const token = localStorage.getItem('rpms_token');
      const isProxyUrl = url.startsWith('/') || url.includes('/api/pdf/');
      let fetchUrl;
      if (isProxyUrl) {
        const relativePath = url.startsWith('/') ? url : new URL(url).pathname;
        const origin = new URL(config.apiBaseUrl).origin;
        fetchUrl = `${origin}${relativePath}`;
      } else {
        fetchUrl = `${config.apiBaseUrl}/download-proxy?url=${encodeURIComponent(url)}&filename=preview.pdf`;
      }

      const response = await fetch(fetchUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const raw = await response.blob();

      // Unconditionally force application/pdf. If the original content-type was
      // a Word doc or binary, preserving it causes the iframe to trigger a download.
      // Forcing it to pdf ensures the browser renders it inline in the viewer.
      const fileBlob = new Blob([raw], { type: 'application/pdf' });
      setActiveView({ type, url: URL.createObjectURL(fileBlob) });
    } catch (err) {
      console.error('[EvaluationPanel] handleView failed:', err);
    } finally {
      setViewLoading(null);
    }
  };

  // Active Pending reviews
  const pendingPubs = publications.filter(p => p.status === 'Submitted');
  const activePub = publications.find(p => p.id === selectedPubId);

  const handleApprove = () => {
    if (!activePub) return;
    setErrorMsg('');
    if (!reviewFile) {
      setErrorMsg('Please upload a reviewed/annotated document to proceed.');
      return;
    }
    onApprove(activePub.id, reviewFile);
    setReviewFile(null);
    onSelectPub(null);
  };


  if (activePub) {
    return (
      <div className="space-y-6">
        {/* Detail Return bar */}
        <div className="flex justify-between items-center bg-pure-white p-4 rounded-xl border border-platinum-silver shadow-xs transition-all duration-300 hover:scale-[1.005] hover:shadow-md">
          <button
            onClick={() => {
              setErrorMsg('');
              setReviewFile(null);
              onSelectPub(null);
            }}
            className="px-4 py-2 text-xs font-bold text-charcoal bg-frost-gray hover:bg-mist-silver border border-platinum-silver rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Review Queue</span>
          </button>
        </div>

        <div className="bg-pure-white rounded-xl border border-platinum-silver shadow-sm transition-all duration-300 hover:scale-[1.005] hover:shadow-md overflow-hidden flex flex-col">
          {/* 1. Header Section: ID (Left), Title/Author (Center), Status (Right) */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/30">
            <div className="flex-1 text-left w-full md:w-auto">
              <span className="text-xs font-mono font-bold text-slate-gray bg-frost-gray px-3 py-1.5 rounded border border-platinum-silver inline-block">
                {activePub.id}
              </span>
            </div>

            <div className="flex-2 text-center w-full md:w-auto">
              <h2 className="text-xl font-extrabold text-charcoal leading-tight mb-1">{activePub.title}</h2>
              <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-slate-gray font-medium">Author: {activePub.author || 'Unknown'}</span>
                {activePub.category && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 uppercase tracking-wide">
                      {activePub.category}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 text-right w-full md:w-auto flex justify-end">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border inline-block ${activePub.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                {activePub.status}
              </span>
            </div>
          </div>

          {/* 2. Middle Section: Uploaded Manuscripts */}
          <div className="p-6 md:p-8 space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-slate-gray tracking-wider text-left">Uploaded Manuscripts</h3>

            <div className="grid grid-cols-1 gap-3">
              <div className="border border-platinum-silver/60 p-4 rounded-xl bg-slate-50/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-frost-gray rounded-lg border border-platinum-silver flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-charcoal text-sm truncate max-w-sm">Manuscript PDF</h4>
                    <p className="text-xs text-slate-gray font-mono mt-1">Submitted {activePub.submissionDate ? new Date(activePub.submissionDate).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                {activePub.manuscriptUrl ? (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleView(activePub.manuscriptUrl, 'manuscript')}
                        className="px-4 py-2 bg-frost-gray hover:bg-mist-silver border border-platinum-silver rounded-lg text-charcoal flex items-center justify-center space-x-1.5 transition-colors text-xs font-bold w-full sm:w-auto shrink-0"
                        title="View Manuscript"
                      >
                        {viewLoading === 'manuscript' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 text-charcoal" />}
                        <span>{activeView.type === 'manuscript' ? 'Close' : 'View'}</span>
                      </button>
                      {/* Download — unchanged */}
                      <button
                        onClick={() => downloadFromUrl(activePub.manuscriptUrl, `Manuscript_${activePub.id}.pdf`)}
                        className="px-4 py-2 bg-frost-gray hover:bg-mist-silver border border-platinum-silver rounded-lg text-charcoal flex items-center justify-center space-x-1.5 transition-colors text-xs font-bold w-full sm:w-auto shrink-0"
                        title="Download Manuscript"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                    {activeView.type === 'manuscript' && (
                      <iframe
                        src={activeView.url}
                        className="w-full rounded-xl border border-slate-200"
                        style={{ height: '640px' }}
                        title="Manuscript Viewer"
                      />
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No file available</span>
                )}
              </div>
            </div>
          </div>

          {/* 3. Bottom Section: Upload Reviewed Document / Reviewed Document */}
          <div className="p-6 md:p-8 space-y-6 bg-slate-50/30">
            {activePub.status === 'Completed' ? (
              <>
                <h3 className="text-xs font-extrabold uppercase text-slate-gray tracking-wider text-left">Reviewed Document</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="border border-emerald-200 p-4 rounded-xl bg-emerald-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-emerald-100/50 rounded-lg border border-emerald-200 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-charcoal text-sm truncate max-w-sm">Evaluated Document</h4>
                        <p className="text-xs text-slate-gray font-mono mt-1">Reviewed on {activePub.lastUpdated ? new Date(activePub.lastUpdated).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                    {activePub.reviewUrl ? (
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                          <button
                            type="button"
                            onClick={() => handleView(activePub.reviewUrl, 'review')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center space-x-1.5 transition-colors text-xs font-bold w-full sm:w-auto shrink-0 shadow-sm"
                            title="View Reviewed Document"
                          >
                            {viewLoading === 'review' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 text-white" />}
                            <span>{activeView.type === 'review' ? 'Close' : 'View Review'}</span>
                          </button>
                          {/* Download — unchanged */}
                          <button
                            onClick={() => downloadFromUrl(activePub.reviewUrl, `Review_${activePub.id}.pdf`)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center space-x-1.5 transition-colors text-xs font-bold w-full sm:w-auto shrink-0 shadow-sm"
                            title="Download Reviewed Document"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download Review</span>
                          </button>
                        </div>
                        {activeView.type === 'review' && (
                          <iframe
                            src={activeView.url}
                            className="w-full rounded-xl border border-emerald-200"
                            style={{ height: '640px' }}
                            title="Review Viewer"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No file available</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xs font-extrabold uppercase text-slate-gray tracking-wider text-left">Upload Reviewed Document</h3>

                <div className="space-y-2 text-left">
                  {!reviewFile ? (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 bg-white hover:bg-slate-50 transition-colors flex flex-col items-center justify-center relative cursor-pointer group shadow-3xs">
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
                      <UploadCloud className="h-10 w-10 text-slate-400 group-hover:text-emerald-500 transition-colors mb-4" />
                      <span className="text-sm font-bold text-charcoal">Drag and drop or browse to upload</span>
                      <span className="text-xs text-slate-500 mt-1.5 font-medium">Supports PDF or Word up to 100 MB</span>
                    </div>
                  ) : (
                    <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-5 flex items-center justify-between shadow-xs animate-fade-in">
                      <div className="flex items-center space-x-4 truncate">
                        <div className="h-12 w-12 bg-emerald-100/50 border border-emerald-200 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="truncate text-left">
                          <p className="text-sm font-bold text-slate-800 truncate">{reviewFile.name}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Ready for upload (Max 100 MB)</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReviewFile(null)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg hover:text-red-700 transition-all cursor-pointer shrink-0"
                        title="Remove file"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200/50 rounded-lg p-3 text-xs text-red-700 flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="flex-1 py-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 shadow-sm rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer animate-fade-in"
                  >
                    <UploadCloud className="h-5 w-5" />
                    <span>Upload Document</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Submission Widget listing
  return (
    <div className="bg-pure-white rounded-xl border border-platinum-silver shadow-xs overflow-hidden transition-all duration-300 hover:scale-[1.005] hover:shadow-md">
      <div className="p-4 border-b border-platinum-silver flex items-center justify-between bg-ice-gray">
        <div>
          <h4 className="font-bold text-charcoal text-sm">Pending Submissions ({pendingPubs.length})</h4>
          <p className="text-[11px] text-slate-gray">Papers awaiting review</p>
        </div>
      </div>

      {pendingPubs.length === 0 ? (
        <div className="p-12 text-center text-slate-gray italic text-xs font-medium">
          No pending publications in the review queue.
        </div>
      ) : (
        <div className="divide-y divide-platinum-silver">
          {pendingPubs.map(pub => (
            <div
              key={pub.id}
              onClick={() => onSelectPub(pub.id)}
              className="p-4 hover:bg-ice-gray/40 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
            >
              <div className="space-y-1 text-left">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-gray bg-frost-gray px-1.5 py-0.5 rounded border border-platinum-silver">
                    {pub.id}
                  </span>
                  {!hideSensitiveInfo && (
                    <span className="text-[9px] text-charcoal bg-frost-gray px-1.5 py-0.5 rounded font-mono font-bold border border-platinum-silver">
                      ₹150
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-charcoal line-clamp-1">{pub.title}</h4>
                <p className="text-xs text-slate-gray font-medium">
                  Author: {pub.author || 'Unknown'} • Division: {pub.department || 'N/A'}
                  {pub.category && ` • Category: ${pub.category}`}
                </p>
              </div>

              <div className="text-right flex items-center space-x-3 shrink-0 justify-end">
                <div className="text-xs text-slate-gray font-mono">
                  {pub.submissionDate ? new Date(pub.submissionDate).toLocaleDateString() : 'N/A'}
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1.5 bg-frost-gray hover:bg-mist-silver text-charcoal border border-platinum-silver rounded text-xs font-bold shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-steel-gray" />
                  <span>Begin Review</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// ADMIN ANALYTICS VIEW
// -------------------------------------------------------------

export function AdminAnalyticsView({ publications }) {
  // Aggregate statistics per faculty member (using inline author/department fields)
  const facultySummaries = {};

  publications.forEach(pub => {
    const authorKey = pub.author || 'Unknown';
    if (!facultySummaries[authorKey]) {
      facultySummaries[authorKey] = {
        name: pub.author || 'Unknown Author',
        department: pub.department || 'Unknown Dept',
        total: 0,
        completed: 0,
        rate: 0,
      };
    }

    const s = facultySummaries[authorKey];
    s.total += 1;
    if (pub.status === 'Completed') s.completed += 1;
  });

  // Calculate rate
  const summariesList = Object.values(facultySummaries).map(s => {
    const nonPending = s.total - (s.total - s.completed); // pending count = total - completed
    s.rate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
    return s;
  });

  return (
    <div className="bg-pure-white rounded-xl border border-platinum-silver shadow-xs overflow-hidden animate-fade-in transition-all duration-300 hover:scale-[1.005] hover:shadow-md">
      <div className="p-4 border-b border-platinum-silver bg-ice-gray flex items-center justify-between">
        <div>
          <h4 className="font-bold text-charcoal text-sm">Faculty Submissions</h4>
          <p className="text-[11px] text-slate-gray">Aggregated submission statistics and completion rates</p>
        </div>
      </div>
      {/* Mobile/Tablet view card list */}
      <div className="lg:hidden divide-y divide-platinum-silver">
        {summariesList.map((f, idx) => (
          <div key={idx} className="p-4 space-y-2 text-xs text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-frost-gray flex items-center justify-center font-serif text-[10px] font-bold text-charcoal border border-platinum-silver">
                  {idx + 1}
                </span>
                <span className="font-bold text-charcoal">{f.name}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-frost-gray text-charcoal border border-platinum-silver">
                {f.rate}% Completed
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">{f.department}</p>
            <div className="grid grid-cols-2 gap-2 text-center pt-2 text-[10px]">
              <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                <span className="block text-[8px] uppercase text-slate-400 font-bold">Total</span>
                <span className="font-bold font-mono text-charcoal text-xs">{f.total}</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                <span className="block text-[8px] uppercase text-slate-400 font-bold">Completed</span>
                <span className="font-bold font-mono text-charcoal text-xs">{f.completed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-ice-gray text-slate-gray uppercase tracking-widest font-extrabold text-[9px] border-b border-platinum-silver">
              <th className="p-4">Faculty Name</th>
              <th className="p-4">Department</th>
              <th className="p-4 text-center font-mono">Total</th>
              <th className="p-4 text-center text-charcoal font-bold">Completed</th>
              <th className="p-4 text-right">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-platinum-silver text-slate-gray">
            {summariesList.map((f, idx) => (
              <tr key={idx} className="hover:bg-ice-gray/30 transition-colors font-medium">
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-frost-gray flex items-center justify-center font-serif text-[10px] font-bold text-charcoal border border-platinum-silver">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-charcoal">{f.name}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600 font-sans">{f.department}</td>
                <td className="p-4 text-center font-mono font-bold text-charcoal">{f.total}</td>
                <td className="p-4 text-center text-charcoal font-mono font-bold">{f.completed}</td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-frost-gray text-charcoal border border-platinum-silver">
                      {f.rate}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
