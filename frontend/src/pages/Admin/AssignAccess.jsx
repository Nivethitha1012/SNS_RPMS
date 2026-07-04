/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, X, Search, Settings } from 'lucide-react';
import { GrantAssessorModal } from '../../components/AssignAccessModal';
import { SearchableDropdown } from '../../components/SearchableDropdown';

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

export const AssignAccessPage = ({
  currentUser,
  users,
  grantTemporaryAdmin,
  revokeTemporaryAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(['All Institutions']);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Collapse search bar on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        searchQuery === ''
      ) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [searchQuery]);

  // Focus input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);
  
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantingTargetUserId, setGrantingTargetUserId] = useState(null);
  const [grantModalType, setGrantModalType] = useState('granted');

  const handleConfirmGrant = (userId, permissions) => {
    grantTemporaryAdmin(userId, permissions);
  };

  const filteredUsers = Object.values(users).filter(u => {
    if (u.role !== 'Faculty') return false;
    
    // Filter by institution
    if (!selectedInstitution.includes('All Institutions')) {
      let userInst = u.institution;
      // Deterministically assign mock institution if none exists
      if (!userInst) {
        const hash = u.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const mod = hash % 4;
        if (mod === 0) userInst = 'SNSCT';
        else if (mod === 1) userInst = 'SNSCE';
        else if (mod === 2) userInst = 'SNSRCAS';
        else userInst = 'SNSCAHS';
      }
      if (!selectedInstitution.includes(userInst)) return false;
    }

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedInstitution]);

  return (
    <div className="space-y-6 text-left w-full">
      <GrantAssessorModal 
        isOpen={grantModalOpen} 
        onClose={() => setGrantModalOpen(false)} 
        facultyUser={grantingTargetUserId ? users[grantingTargetUserId] : null} 
        type={grantModalType} 
        onConfirmGrant={handleConfirmGrant}
      />
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
        
        {/* Search and filters row */}
        <div className="mb-6 flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap items-start sm:items-center justify-between gap-3 w-full">
          {/* Search matches name or department - Dynamic Lens */}
          <div
            ref={searchContainerRef}
            className={`relative flex items-center h-10 transition-all duration-300 ease-out rounded-lg border shrink-0 ${isSearchExpanded
                ? 'w-full sm:w-64 md:w-72 px-3 bg-white border-slate-300 shadow-xs'
                : 'w-10 px-0 bg-slate-50 border-slate-200 shadow-none hover:bg-slate-100 hover:border-slate-300'
              }`}
          >
            <button
              type="button"
              onClick={() => {
                setIsSearchExpanded(!isSearchExpanded);
                if (isSearchExpanded) setSearchQuery('');
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
              placeholder="Search faculty by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs pl-2 bg-transparent text-slate-900 border-none outline-none focus:ring-0 focus:outline-none transition-opacity duration-200 ${isSearchExpanded ? 'opacity-100 w-full pointer-events-auto' : 'opacity-0 w-0 pointer-events-none'
                }`}
            />
          </div>

          {/* Institution Dropdown */}
          <div className="w-full sm:w-64 md:w-72 shrink-0 relative z-20">
            <SearchableDropdown
              options={INSTITUTION_OPTIONS}
              value={selectedInstitution}
              onChange={setSelectedInstitution}
              placeholder="Search institution..."
              isMulti={true}
            />
          </div>
        </div>

        {/* Mobile/Tablet Card list */}
        <div className="lg:hidden space-y-4">
          {paginatedUsers.map((user) => {
              return (
                <div key={user.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{user.name}</p>
                  </div>
                  <div className="text-[11px] text-slate-655 space-y-1">
                    <p><strong className="font-semibold">Department:</strong> {user.department}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-2 text-xs text-slate-600">
                    <p>
                      <strong className="font-semibold text-slate-500">Access Grants:</strong>{' '}
                      <span className="font-medium text-slate-700">{user.grantCount || 0} times granted</span>
                    </p>
                  </div>
                  <div className="pt-2">
                    {user.isTemporaryAdmin ? (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => {
                            setGrantingTargetUserId(user.id);
                            setGrantModalType('granted');
                            setGrantModalOpen(true);
                          }}
                          className="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 shadow-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          <Settings className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            revokeTemporaryAdmin(user.id);
                            setGrantingTargetUserId(user.id);
                            setGrantModalType('revoked');
                            setGrantModalOpen(true);
                          }}
                          className="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 shadow-sm bg-red-50 text-red-650 hover:bg-red-100/80"
                        >
                          <X className="h-3 w-3" />
                          <span>Revoke</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setGrantingTargetUserId(user.id);
                          setGrantModalType('granted');
                          setGrantModalOpen(true);
                        }}
                        className="w-full py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 shadow-sm bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span>Grant Assessor Role</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Desktop view table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest font-extrabold text-[9px] border-b border-slate-200">
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Department</th>
                <th className="p-4">Access Grants</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">
                        <p className="font-bold text-slate-800 text-xs">{user.name}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-700">{user.department}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-700 font-medium">
                          {user.grantCount || 0} times granted
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        {user.isTemporaryAdmin ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setGrantingTargetUserId(user.id);
                                setGrantModalType('granted');
                                setGrantModalOpen(true);
                              }}
                              className="px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 shadow-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              <Settings className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                revokeTemporaryAdmin(user.id);
                                setGrantingTargetUserId(user.id);
                                setGrantModalType('revoked');
                                setGrantModalOpen(true);
                              }}
                              className="px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 shadow-sm bg-red-50 text-red-650 hover:bg-red-100/80"
                            >
                              <X className="h-3 w-3" />
                              <span>Revoke</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setGrantingTargetUserId(user.id);
                              setGrantModalType('granted');
                              setGrantModalOpen(true);
                            }}
                            className="px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center mx-auto space-x-1 shadow-sm bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            <span>Grant Assessor Role</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-platinum-silver bg-pure-white px-5 py-4 rounded-b-xl mt-4">
            <p className="text-xs text-steel-gray font-medium">
              Showing <span className="font-bold text-charcoal">{filteredUsers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-bold text-charcoal">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span>{' '}
              of <span className="font-bold text-charcoal">{filteredUsers.length}</span> results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-xs font-bold text-charcoal ring-1 ring-inset ring-platinum-silver hover:bg-frost-gray disabled:opacity-40 disabled:cursor-not-allowed bg-pure-white transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                if (totalPages > 7 && (p < currentPage - 2 || p > currentPage + 2) && p !== 1 && p !== totalPages) {
                  if (p === 2 || p === totalPages - 1) return <span key={p} className="relative inline-flex items-center px-3 py-2 text-xs font-bold text-charcoal ring-1 ring-inset ring-platinum-silver bg-pure-white">...</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`relative inline-flex items-center px-3 py-2 text-xs font-bold ring-1 ring-inset ring-platinum-silver transition-colors ${
                      p === currentPage
                        ? 'z-10 bg-charcoal text-pure-white shadow-sm'
                        : 'text-charcoal bg-pure-white hover:bg-frost-gray'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="relative inline-flex items-center rounded-r-xl px-3 py-2 text-xs font-bold text-charcoal ring-1 ring-inset ring-platinum-silver hover:bg-frost-gray disabled:opacity-40 disabled:cursor-not-allowed bg-pure-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
