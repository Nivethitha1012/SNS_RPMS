/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Eye, ArrowLeft, Download, Search, Smartphone, CheckCircle, RefreshCw, Lock, AlertCircle, X, FileUp } from 'lucide-react';
import { downloadFile, getFileUrl } from '../../fileStore';

export const PublicationsPage = ({
  currentUser,
  publications,
  selectedPubId,
  setSelectedPubId,
  onReupload,
  onPayToUnlock,
}) => {
  const [fSearchText, setFSearchText] = useState('');
  const [fStatusFilter, setFStatusFilter] = useState('All');
  const [isFacultySearchExpanded, setIsFacultySearchExpanded] = useState(false);

  // States for reupload and pay-to-unlock
  const [selectedFileMap, setSelectedFileMap] = useState({});
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTargetPubId, setPaymentTargetPubId] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const facultySearchContainerRef = useRef(null);
  const facultySearchInputRef = useRef(null);

  // Collapse search bar on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        facultySearchContainerRef.current &&
        !facultySearchContainerRef.current.contains(e.target) &&
        fSearchText === ''
      ) {
        setIsFacultySearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [fSearchText]);

  // Focus input when expanded
  useEffect(() => {
    if (isFacultySearchExpanded && facultySearchInputRef.current) {
      facultySearchInputRef.current.focus();
    }
  }, [isFacultySearchExpanded]);

  const facultyViewPubs = publications.filter(p => p.authorId === currentUser.id);

  const filteredFacultyPubs = facultyViewPubs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(fSearchText.toLowerCase()) ||
      p.id.toLowerCase().includes(fSearchText.toLowerCase());
    const matchesStatus = fStatusFilter === 'All' || p.status === fStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full">
      {!selectedPubId ? (
        <>
          {/* Search and filters row */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left animate-fade-in transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-slate-300">
            <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full">
              {/* Search matches title or id - Dynamic Lens */}
              <div
                ref={facultySearchContainerRef}
                className={`relative flex items-center h-10 transition-all duration-300 ease-out rounded-lg border shrink-0 ${isFacultySearchExpanded
                    ? 'w-64 sm:w-80 px-3 bg-white border-slate-300 shadow-xs'
                    : 'w-10 px-0 bg-slate-50 border-slate-200 shadow-none hover:bg-slate-100 hover:border-slate-300'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isFacultySearchExpanded) {
                      setIsFacultySearchExpanded(true);
                    }
                  }}
                  className={`flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${isFacultySearchExpanded
                      ? 'text-slate-400'
                      : 'w-10 h-10 text-slate-500 hover:text-charcoal'
                    }`}
                  title="Search"
                >
                  <Search className="h-4 w-4" />
                </button>

                <input
                  ref={facultySearchInputRef}
                  type="text"
                  placeholder="Search by title or ID..."
                  value={fSearchText}
                  onChange={(e) => setFSearchText(e.target.value)}
                  className={`w-full text-xs pl-2 bg-transparent text-slate-900 border-none outline-none focus:ring-0 focus:outline-none transition-opacity duration-200 ${isFacultySearchExpanded ? 'opacity-100 w-full pointer-events-auto' : 'opacity-0 w-0 pointer-events-none'
                    }`}
                />
              </div>

              {/* Status */}
              <div className="flex-1 min-w-35">
                <select
                  value={fStatusFilter}
                  onChange={(e) => setFStatusFilter(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 outline-none bg-white font-sans text-slate-700"
                >
                  <option value="All">All statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending reviews</option>
                </select>
              </div>
            </div>
          </div>

          {/* Publications listings (Responsive table & card views) */}
          <div className="space-y-4 animate-fade-in">
            {/* Desktop view table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest font-extrabold text-[9px] border-b border-slate-200">
                      <th className="p-4 text-center">S.No</th>
                      <th className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span>Publication</span>
                          <span>ID</span>
                        </div>
                      </th>
                      <th className="p-4 text-center">Title</th>
                      <th className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span>Uploaded</span>
                          <span>Date</span>
                        </div>
                      </th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span>Reviewed</span>
                          <span>Date</span>
                        </div>
                      </th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-650">
                    {filteredFacultyPubs.map((pub, index) => (
                      <tr key={pub.id} className="hover:bg-slate-50/50 transition-colors font-sans py-3">
                        <td className="p-4 text-slate-400 text-center">{index + 1}</td>
                        <td className="p-4 font-mono font-bold text-slate-400 text-center">{pub.id}</td>
                        <td className="p-4 max-w-sm text-left">
                          <span className="font-bold text-slate-900 block leading-snug">{pub.title}</span>
                        </td>
                        <td className="p-4 text-slate-400 text-center font-medium">
                          {new Date(pub.submissionDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 text-[9px] uppercase font-mono font-extrabold rounded-full ${pub.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                              pub.status === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                            {pub.status === 'Closed – Maximum Revision Limit Reached' ? 'Closed' : pub.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-center font-medium">
                          {pub.status === 'Pending' ? '-' : new Date(pub.lastUpdated).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedPubId(pub.id)}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm font-sans flex items-center space-x-1 cursor-pointer transition-all active:scale-95 mx-auto"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredFacultyPubs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-slate-455 italic font-semibold">
                          No matching manuscripts filtered in research index. Please modify criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center bg-pure-white p-5 rounded-2xl border border-platinum-silver shadow-xs text-left animate-fade-in">
            <button
              onClick={() => {
                setSelectedPubId(null);
              }}
              className="px-4 py-2 text-xs font-bold text-charcoal bg-frost-gray hover:bg-mist-silver border border-platinum-silver rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Portfolio List</span>
            </button>
          </div>

          {/* Drilling down panel - publication detail card */}
          {(() => {
            const target = publications.find(p => p.id === selectedPubId);
            if (!target) return null;
            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-left animate-fade-in space-y-6">
                {/* Publication Header Card */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  {/* Badges Row */}
                  <div className="flex justify-between items-center w-full">
                    <span className="bg-white border border-slate-200 font-mono font-bold px-3 py-1.5 rounded-lg text-xs text-slate-700 shadow-3xs">
                      ID: {target.id}
                    </span>
                    <span className={`px-3 py-1.5 rounded-lg text-xs uppercase font-mono font-extrabold shadow-3xs border ${target.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                        target.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-250' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                      {target.status === 'Closed – Maximum Revision Limit Reached' ? 'Closed' : target.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-sans font-black text-slate-900 text-2xl leading-tight tracking-tight pt-1 text-center w-full">
                    {target.title}
                  </h3>

                  {/* Faculty Name Prominently Displayed & Date of Submission */}
                  <div className="pt-3 space-y-2 border-t border-slate-200 text-xs font-semibold text-slate-600 flex flex-col items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Faculty Author:</span>
                      <span className="text-slate-800 font-extrabold">{target.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Date of Submission:</span>
                      <span className="text-slate-800 font-extrabold">
                        {new Date(target.submissionDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Version Control - Only show Current Version */}
                <div className="space-y-4">
                  {(() => {
                    const v = target.versions[target.versions.length - 1];
                    if (!v) return null;
                    return (
                      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 relative hover:border-slate-350 transition-all">
                        <div className="flex items-center font-bold border-b border-slate-100 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-slate-900 text-sm font-extrabold">Current Version: V{v.version}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Uploaded Date: {new Date(v.uploadDate).toLocaleDateString()}</span>
                        </div>

                        {/* Download Slots Stacking Vertically */}
                        <div className="flex flex-col space-y-3 pt-1">
                          {/* Faculty Document Slot */}
                          <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left w-full">
                            <div className="flex-1 min-w-0">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 block">Faculty Upload</span>
                              <p className="text-xs font-bold text-slate-800 truncate" title={v.fileName}>{v.fileName}</p>
                              <span className="text-[10px] text-slate-500 font-mono block">{v.fileSize}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => downloadFile(target.id, v.version, v.fileName)}
                              className="py-2 px-4 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs active:scale-98 transition-all shrink-0 w-full sm:w-45 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Download className="h-3.5 w-3.5 text-white" />
                              <span>Download Original</span>
                            </button>
                          </div>

                          {/* Show the Reviewed PDF if it exists */}
                          {(v.reviewedFileName || v.reviewDate) && (
                            <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left w-full">
                              <div className="flex-1 min-w-0">
                                <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 block">Dean Evaluation PDF</span>
                                <p className="text-xs font-bold text-slate-850 truncate" title={v.reviewedFileName || `reviewed_${v.fileName.replace('.pdf', '')}.pdf`}>
                                  {v.reviewedFileName || `reviewed_${v.fileName.replace('.pdf', '')}.pdf`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => downloadFile(target.id, v.version, v.reviewedFileName || `reviewed_${v.fileName}`)}
                                className="py-2 px-4 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs active:scale-98 transition-all shrink-0 w-full sm:w-45 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Download className="h-3.5 w-3.5 text-white" />
                                <span>Download Reviewed</span>
                              </button>
                            </div>
                          )}

                          {/* Reupload Lock Warning Card (For latest version if Closed limit reached) */}
                          {target.status === 'Closed – Maximum Revision Limit Reached' && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center animate-fade-in w-full">
                              <span className="text-xs font-bold text-slate-500">Maximum revision attempts reached.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* simulated payment modal wrapper */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-100 overflow-hidden shadow-2xl relative animate-slide-in text-left">
            
            {/* Razorpay header */}
            <div className="flex items-center justify-between bg-[#2d2d2d] px-5 py-4">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded bg-[#3395FF] flex items-center justify-center">
                  <span className="text-white font-black text-[10px]">R</span>
                </div>
                <span className="text-white font-bold text-sm tracking-tight">Razorpay</span>
              </div>
              <button 
                onClick={() => setPaymentModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                disabled={paymentLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {paymentSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3 text-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600 animate-bounce" />
                  </div>
                  <h3 className="font-extrabold text-slate-850 text-sm">Payment Verified!</h3>
                  <p className="text-xs text-slate-500">Unlocking publication revisions console...</p>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setPaymentError('');

                  if (!upiId.trim() || !upiId.includes('@')) {
                    setPaymentError('Please enter a valid UPI ID (e.g. name@upi)');
                    return;
                  }

                  setPaymentLoading(true);
                  setTimeout(() => {
                    setPaymentLoading(false);
                    setPaymentSuccess(true);
                    
                    setTimeout(() => {
                      if (paymentTargetPubId) {
                        const generatedTxn = 'TXN-' + Math.floor(1000000 + Math.random() * 9000000);
                        onPayToUnlock(paymentTargetPubId, generatedTxn);
                      }
                      setPaymentModalOpen(false);
                      setPaymentSuccess(false);
                      setUpiId('');
                      setPaymentTargetPubId(null);
                    }, 1000);
                  }, 1500);
                }} className="space-y-4">
                  <div className="text-center pb-2">
                    <p className="text-xs text-slate-505">Revisions Unlock Fee</p>
                    <p className="text-2xl font-black font-mono text-slate-850">₹150</p>
                  </div>

                  {/* QR code */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center">
                    <div className="w-40 h-40 bg-white border-2 border-slate-800 rounded-lg flex items-center justify-center p-1 relative">
                      <div className="w-full h-full relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-[3px] border-slate-800 rounded-sm" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-[3px] border-slate-800 rounded-sm" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-[3px] border-slate-800 rounded-sm" />
                        <div className="absolute top-2 left-2 w-3 h-3 bg-slate-800 rounded-sm" />
                        <div className="absolute top-2 right-2 w-3 h-3 bg-slate-800 rounded-sm" />
                        <div className="absolute bottom-2 left-2 w-3 h-3 bg-slate-800 rounded-sm" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-6 w-6 rounded bg-[#3395FF] flex items-center justify-center">
                            <span className="text-white font-black text-[9px]">R</span>
                          </div>
                        </div>
                        {[20,30,40,50,60,70,80].map(top => (
                          <div key={top} className="absolute flex gap-0.5" style={{top:`${top}%`,left:'28%',right:'28%'}}>
                            {[...Array(6)].map((_,i) => (
                              <div key={i} className={`h-0.5 w-0.5 bg-slate-800 rounded-full ${(top+i)%3===0?'opacity-0':''}`} />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold mt-2">Scan QR with UPI Apps</span>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-150" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">or enter UPI ID</span>
                    <div className="flex-1 h-px bg-slate-150" />
                  </div>

                  {/* UPI Input */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-500 uppercase">UPI ID</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full text-xs font-mono border border-slate-250 rounded-lg pl-8 pr-3 py-2 bg-white text-slate-900 focus:outline-none focus:border-[#3395FF] focus:ring-1 focus:ring-[#3395FF] transition-all"
                        disabled={paymentLoading}
                      />
                    </div>
                    {paymentError && <p className="text-[10px] text-red-600 font-bold">{paymentError}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full px-5 py-3 bg-[#3395FF] hover:bg-[#1a7ee0] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <span>Complete UPI Verification</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
