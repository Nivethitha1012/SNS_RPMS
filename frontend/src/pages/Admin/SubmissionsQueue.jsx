/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { SearchableDropdown } from '../../components/common/SearchableDropdown';
import { useNavigate } from 'react-router-dom';

const INSTITUTION_OPTIONS = [
  'All Institutions',
  'SNSCT',
  'SNSCE',
  'SNSRCAS',
  'SNSCAHS',
  'SNSCNURSING',
  'SNSCPHYSIO',
  'SNSCPHS',
  'DRSNSCEDU',
  'SNSBSPINE',
  'SNSACADEMY'
];

export const AdminQueuePage = ({
  currentUser,
  publications,
}) => {
  const navigate = useNavigate();
  const [aSearchText, setASearchText] = useState('');
  const [aStatusFilter, setAStatusFilter] = useState('All statuses');
  const [aInstitutionFilter, setAInstitutionFilter] = useState('All Institutions');
  const [isAdminSearchExpanded, setIsAdminSearchExpanded] = useState(false);

  const adminSearchContainerRef = useRef(null);
  const adminSearchInputRef = useRef(null);

  // Collapse search bar on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        adminSearchContainerRef.current &&
        !adminSearchContainerRef.current.contains(e.target) &&
        aSearchText === ''
      ) {
        setIsAdminSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [aSearchText]);

  // Focus input when expanded
  useEffect(() => {
    if (isAdminSearchExpanded && adminSearchInputRef.current) {
      adminSearchInputRef.current.focus();
    }
  }, [isAdminSearchExpanded]);

  const clearAdminFilters = () => {
    setASearchText('');
    setAStatusFilter('All statuses');
    setAInstitutionFilter('All Institutions');
  };

  // Admin submission table list filter
  const filteredAdminPubs = publications.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(aSearchText.toLowerCase()) ||
      p.author.toLowerCase().includes(aSearchText.toLowerCase()) ||
      p.id.toLowerCase().includes(aSearchText.toLowerCase());

    const matchesStatus = aStatusFilter === 'All statuses' || p.status === aStatusFilter;

    // Determine institution, fallback for mock data
    let pubInst = p.institution;
    if (!pubInst) {
      const hash = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const mod = hash % 4;
      if (mod === 0) pubInst = 'SNSCT';
      else if (mod === 1) pubInst = 'SNSCE';
      else if (mod === 2) pubInst = 'SNSRCAS';
      else pubInst = 'SNSCAHS';
    }
    const matchesInst = aInstitutionFilter === 'All Institutions' || pubInst === aInstitutionFilter;

    return matchesSearch && matchesStatus && matchesInst;
  });

  return (
    <div className="space-y-6 w-full animate-fade-in">

      {/* Admin advanced filters block */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-slate-300">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full">
          {/* Search matches title or authors - Dynamic Lens */}
          <div
            ref={adminSearchContainerRef}
            className={`relative flex items-center h-10 transition-all duration-300 ease-out rounded-lg border shrink-0 ${isAdminSearchExpanded
              ? 'w-64 sm:w-80 px-3 bg-white border-slate-300 shadow-xs'
              : 'w-10 px-0 bg-slate-50 border-slate-200 shadow-none hover:bg-slate-100 hover:border-slate-300'
              }`}
          >
            <button
              type="button"
              onClick={() => {
                if (!isAdminSearchExpanded) {
                  setIsAdminSearchExpanded(true);
                }
              }}
              className={`flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${isAdminSearchExpanded
                ? 'text-slate-400'
                : 'w-10 h-10 text-slate-500 hover:text-charcoal'
                }`}
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <input
              ref={adminSearchInputRef}
              type="text"
              placeholder="Search by title, ID, or author..."
              value={aSearchText}
              onChange={(e) => setASearchText(e.target.value)}
              className={`w-full text-xs pl-2 bg-transparent text-slate-900 border-none outline-none focus:ring-0 focus:outline-none transition-opacity duration-200 ${isAdminSearchExpanded ? 'opacity-100 w-full pointer-events-auto' : 'opacity-0 w-0 pointer-events-none'
                }`}
            />
          </div>

          {/* Status */}
          <div className="flex-1 min-w-35">
            <SearchableDropdown
              options={['All statuses', 'Pending', 'Approved']}
              value={aStatusFilter}
              onChange={setAStatusFilter}
              placeholder="Status"
            />
          </div>

          {/* Institution */}
          <div className="flex-1 min-w-45">
            <SearchableDropdown
              options={INSTITUTION_OPTIONS}
              value={aInstitutionFilter}
              onChange={setAInstitutionFilter}
              placeholder="Search institution..."
            />
          </div>

          <div className="shrink-0">
            <button
              onClick={clearAdminFilters}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors text-center cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Active review workspace list router */}
      <div className="grid grid-cols-1 gap-6">
        {/* Render cumulative audit queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">


          {/* Desktop/Global view table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-250 border-collapse text-xs text-left">
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
                  <th className="p-4 text-center">Category</th>
                  <th className="p-4 text-center">Institution</th>

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
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655">
                {filteredAdminPubs.map((pub, index) => (
                  <tr key={pub.id} className="hover:bg-slate-50/40 transition-colors py-2 font-medium">
                    <td className="p-4 text-slate-400 text-center">{index + 1}</td>
                    <td className="p-4 font-mono font-bold text-slate-400 text-center">{pub.id}</td>
                    <td className="p-4 max-w-xs truncate leading-snug font-bold text-slate-900 text-left" title={pub.title}>{pub.title}</td>
                    <td className="p-4 text-slate-505 text-center">{pub.category || 'N/A'}</td>
                    <td className="p-4 font-sans text-slate-505 text-center">
                      {(() => {
                        let pubInst = pub.institution;
                        if (!pubInst) {
                          const hash = pub.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          const mod = hash % 4;
                          if (mod === 0) pubInst = 'SNSCT';
                          else if (mod === 1) pubInst = 'SNSCE';
                          else if (mod === 2) pubInst = 'SNSRCAS';
                          else pubInst = 'SNSCAHS';
                        }
                        return pubInst;
                      })()}
                    </td>

                    <td className="p-4 text-slate-400 text-center">{new Date(pub.submissionDate).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] uppercase font-mono font-black rounded-full ${pub.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        pub.status === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                        {pub.status === 'Closed – Maximum Revision Limit Reached' ? 'Closed' : pub.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-center">
                      {pub.status === 'Pending' ? '-' : new Date(pub.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {(!currentUser.isTemporaryAdmin || currentUser.granularPermissions?.features?.includes('evaluate_manuscript')) && (
                          <button
                            onClick={() => {
                              navigate('/admin/evaluation', { state: { pubId: pub.id } });
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all active:scale-95 mx-auto"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Evaluate</span>
                          </button>
                        )}
                        {(!currentUser.isTemporaryAdmin || currentUser.granularPermissions?.features?.includes('delete_manuscript')) && (
                          <button
                            onClick={() => {
                              alert("Delete Manuscript clicked! (Functionality to be wired)");
                            }}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all active:scale-95 mx-auto"
                          >
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAdminPubs.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-10 text-center text-slate-400 italic">
                      No publications index records matching active search filters.
                    </td>
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
