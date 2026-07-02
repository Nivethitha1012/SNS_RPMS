/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { AdminReviews } from '../../components/evaluation/EvaluationPanel';
import { TempAdminDashboard } from '../../components/dashboard/ActivityFeed';

export const TempAdminPage = ({
  currentUser,
  publications,
  users,
  selectedPubIdForReview,
  setSelectedPubIdForReview,
  onApprove,
  onReject,
}) => {
  const [aSearchText, setASearchText] = useState('');
  const [aStatusFilter, setAStatusFilter] = useState('All');
  const [aDepartmentFilter, setADepartmentFilter] = useState('All');
  const [isTempAdminSearchExpanded, setIsTempAdminSearchExpanded] = useState(false);

  const tempAdminSearchContainerRef = useRef(null);
  const tempAdminSearchInputRef = useRef(null);

  // Collapse search bar on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        tempAdminSearchContainerRef.current &&
        !tempAdminSearchContainerRef.current.contains(e.target) &&
        aSearchText === ''
      ) {
        setIsTempAdminSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [aSearchText]);

  // Focus input when expanded
  useEffect(() => {
    if (isTempAdminSearchExpanded && tempAdminSearchInputRef.current) {
      tempAdminSearchInputRef.current.focus();
    }
  }, [isTempAdminSearchExpanded]);

  const clearAdminFilters = () => {
    setASearchText('');
    setAStatusFilter('All');
    setADepartmentFilter('All');
  };

  const uniqueDepartments = Array.from(new Set(publications.map(p => p.department)));

  // Filter publications based on current Temp Admin access restrictions
  const baseTempAdminPubs = publications.filter(p => {
    if (currentUser.tempAdminAccessType === 'full') {
      return p.authorId !== currentUser.id;
    }
    return p.assignedReviewerId === currentUser.id;
  });

  const tempAdminPubs = baseTempAdminPubs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(aSearchText.toLowerCase()) ||
      p.author.toLowerCase().includes(aSearchText.toLowerCase()) ||
      p.id.toLowerCase().includes(aSearchText.toLowerCase());

    const matchesStatus = aStatusFilter === 'All' || p.status === aStatusFilter;
    const matchesDept = aDepartmentFilter === 'All' || p.department === aDepartmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const tempAdminStats = {
    total: tempAdminPubs.length,
    pending: tempAdminPubs.filter(p => p.status === 'Pending').length,
    approved: tempAdminPubs.filter(p => p.status === 'Approved').length,
  };

  if (selectedPubIdForReview !== null) {
    if (currentUser.tempAdminAccessType === 'full') {
      return (
        <div className="space-y-6 w-full">
          <AdminReviews
            publications={publications}
            onApprove={onApprove}
            onReject={onReject}
            selectedPubId={selectedPubIdForReview}
            onSelectPub={setSelectedPubIdForReview}
            users={users}
            hideSensitiveInfo={true}
          />
        </div>
      );
    } else {
      return (
        <TempAdminDashboard
          publications={publications}
          currentUser={currentUser}
          onApprove={onApprove}
          onReject={onReject}
          onSelectReview={setSelectedPubIdForReview}
          selectedPubIdForReview={selectedPubIdForReview}
        />
      );
    }
  }

  return (
    <div className="space-y-6 w-full text-left">
      {/* Stats scorecard banner */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow flex flex-col justify-between text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
          <span className="text-[9px] uppercase font-bold text-emerald-600">Approved</span>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-1">{tempAdminStats.approved}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow flex flex-col justify-between text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
          <span className="text-[9px] uppercase font-bold text-amber-600">Pending</span>
          <span className="text-2xl font-black font-mono text-amber-600 mt-1">{tempAdminStats.pending}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow flex flex-col justify-between text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Total</span>
            <span className="text-[9px] uppercase font-bold text-slate-400 block mt-0.5">Publications</span>
          </div>
          <span className="text-2xl font-black font-mono text-slate-800 mt-1">{tempAdminStats.total}</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left animate-fade-in transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-slate-300">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full">
          {/* Search Dynamic Lens */}
          <div
            ref={tempAdminSearchContainerRef}
            className={`relative flex items-center h-10 transition-all duration-300 ease-out rounded-lg border shrink-0 ${isTempAdminSearchExpanded
                ? 'w-64 sm:w-80 px-3 bg-white border-slate-300 shadow-xs'
                : 'w-10 px-0 bg-slate-50 border-slate-200 shadow-none hover:bg-slate-100 hover:border-slate-300'
              }`}
          >
            <button
              type="button"
              onClick={() => { if (!isTempAdminSearchExpanded) setIsTempAdminSearchExpanded(true); }}
              className={`flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${isTempAdminSearchExpanded ? 'text-slate-400' : 'w-10 h-10 text-slate-500 hover:text-charcoal'}`}
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              ref={tempAdminSearchInputRef}
              type="text"
              placeholder="Search by title, ID, or author..."
              value={aSearchText}
              onChange={(e) => setASearchText(e.target.value)}
              className={`w-full text-xs pl-2 bg-transparent text-slate-900 border-none outline-none focus:ring-0 focus:outline-none transition-opacity duration-200 ${isTempAdminSearchExpanded ? 'opacity-100 w-full pointer-events-auto' : 'opacity-0 w-0 pointer-events-none'}`}
            />
          </div>

          <div className="flex-1 min-w-35">
            <select value={aStatusFilter} onChange={(e) => setAStatusFilter(e.target.value)} className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 outline-none bg-white font-sans text-slate-700">
              <option value="All">All statuses</option>
              <option value="Pending">Pending reviews</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="flex-1 min-w-45">
            <select value={aDepartmentFilter} onChange={(e) => setADepartmentFilter(e.target.value)} className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700">
              <option value="All">All departments</option>
              {uniqueDepartments.map((d, i) => <option key={i} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="shrink-0">
            <button onClick={clearAdminFilters} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors text-center cursor-pointer">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Submission Queue */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
          <div className="p-4 border-b border-secondary bg-slate-50 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-850 text-sm">Submission Queue</h4>
            </div>
          </div>

          {/* Mobile/Tablet view */}
          <div className="lg:hidden space-y-4 p-4">
            {tempAdminPubs.map((pub) => (
              <div key={pub.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-400 block">{pub.id}</span>
                    <span className="font-bold text-slate-900 text-xs block mt-0.5">{pub.author}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] uppercase font-mono font-black rounded-full ${pub.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : pub.status === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                    {pub.status === 'Closed – Maximum Revision Limit Reached' ? 'Closed' : pub.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block text-xs leading-snug truncate" title={pub.title}>{pub.title}</span>
                  <span className="text-[10px] text-slate-505 block">Dept: {pub.department}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[11px] text-slate-505 font-medium">
                  <div>
                    <p>Submitted: {new Date(pub.submissionDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setSelectedPubIdForReview(pub.id)} className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm font-sans flex items-center space-x-1 cursor-pointer transition-all active:scale-95">
                      <Eye className="h-3 w-3" />
                      <span>Evaluate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {tempAdminPubs.length === 0 && (
              <div className="p-8 text-center text-slate-455 italic">No publications index records matching active search filters.</div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest font-extrabold text-[9px] border-b border-slate-200">
                  <th className="p-4 text-center">S.No</th>
                  <th className="p-4 text-center"><div className="flex flex-col items-center"><span>Publication</span><span>ID</span></div></th>
                  <th className="p-4">Faculty</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 text-center">Title</th>
                  <th className="p-4 text-center"><div className="flex flex-col items-center"><span>Uploaded</span><span>Date</span></div></th>
                  <th className="p-4 text-center"><div className="flex flex-col items-center"><span>Reviewed</span><span>Date</span></div></th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655">
                {tempAdminPubs.map((pub, index) => (
                  <tr key={pub.id} className="hover:bg-slate-50/40 transition-colors py-2 font-medium">
                    <td className="p-4 text-slate-400 text-center">{index + 1}</td>
                    <td className="p-4 font-mono font-bold text-slate-400 text-center">{pub.id}</td>
                    <td className="p-4 font-bold text-slate-900">{pub.author}</td>
                    <td className="p-4 font-sans text-slate-505">{pub.department}</td>
                    <td className="p-4 max-w-xs truncate leading-snug font-bold text-slate-900 text-left" title={pub.title}>{pub.title}</td>
                    <td className="p-4 text-slate-400 text-center">{new Date(pub.submissionDate).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-400 text-center">{pub.status === 'Pending' ? '-' : new Date(pub.lastUpdated).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] uppercase font-mono font-black rounded-full ${pub.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : pub.status === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-red-100 text-red-800'}`}>
                        {pub.status === 'Closed – Maximum Revision Limit Reached' ? 'Rejected' : pub.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => setSelectedPubIdForReview(pub.id)} className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all active:scale-95 mx-auto">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Evaluate</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {tempAdminPubs.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-400 italic">No publications index records matching active search filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
