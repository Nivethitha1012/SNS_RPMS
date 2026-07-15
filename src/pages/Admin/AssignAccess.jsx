/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, X, Search, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { GrantAssessorModal } from '../../components/AssignAccessModal';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import * as tempAdminApi from '../../api/tempAdminApi';
import { INSTITUTION_OPTIONS, INSTITUTION_MAP } from '../../utils/constants';

export const AssignAccessPage = ({
  currentUser,
  grantTemporaryAdmin,
  revokeTemporaryAdmin,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('All Institutions');
  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const handleFacultyClick = (userId) => {
    const basePath = location.pathname.startsWith('/admin')
      ? '/admin/faculty'
      : '/faculty/faculty-profiles';
    navigate(`${basePath}/${userId}`);
  };

  const fetchFaculty = async () => {
    setLoadingFaculty(true);
    try {
      const res = await tempAdminApi.fetchFacultyForAccess({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        institution: selectedInstitution
      });
      setFacultyList((res.faculties || []).map(r => ({
        id: r.user_id, name: r.name, department: r.department,
        institution: INSTITUTION_MAP[r.institution_name] || r.institution_name || '',
        isTemporaryAdmin: r.temp_admin,
        isAdmin: r.admin,
        email: r.email,
        assignedBy: r.assigned_by,
      })));
      setTotalItems(res.total || 0);
    } catch (err) {
      console.error('[AssignAccess] Failed to fetch faculty:', err);
    } finally {
      setLoadingFaculty(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [currentPage, searchQuery, selectedInstitution]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedInstitution]);

  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantingTargetUserId, setGrantingTargetUserId] = useState(null);
  const [grantModalType, setGrantModalType] = useState('granted');
  const [pendingPermissions, setPendingPermissions] = useState({ pages: [], features: [] });

  const handleConfirmGrant = async (userId, permissions) => {
    await grantTemporaryAdmin(userId, permissions);
    await fetchFaculty();
  };

  const handleEditAccess = async (userId) => {
    try {
      const user = facultyList.find(u => u.id === userId);
      let pages = [];
      let features = [];

      if (user?.isTemporaryAdmin) {
        const dbPerms = await tempAdminApi.fetchPermissions(userId);
        
        if (dbPerms.dashboard) pages.push('dashboard');
        if (dbPerms.submissions_queue) pages.push('queue');
        if (dbPerms.upload_manuscript) pages.push('upload');
        if (dbPerms.assign_access) pages.push('assign_access');
        if (dbPerms.manage_users) pages.push('faculty_profiles');
        
        if (dbPerms.export_data) features.push('export_data');
        if (dbPerms.delete_manuscript) features.push('delete');
        if (dbPerms.evaluate_manuscript) features.push('edit');
      }

      const permsForModal = { pages, features };
      setPendingPermissions(permsForModal);

      setFacultyList(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, granularPermissions: permsForModal } 
          : u
      ));
      
      setGrantingTargetUserId(userId);
      setGrantModalType('granted');
      setGrantModalOpen(true);
    } catch (err) {
      console.error("Failed to load permissions", err);
      alert("Failed to load user permissions.");
    }
  };

  const handleRevoke = async (userId) => {
    await revokeTemporaryAdmin(userId);
    await fetchFaculty();
  };

  const paginatedUsers = facultyList;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const grantingTarget = facultyList.find(u => u.id === grantingTargetUserId) || null;
  // Merge pendingPermissions directly into grantingTarget to avoid batching race conditions
  const grantingTargetWithPerms = grantingTarget
    ? { ...grantingTarget, granularPermissions: pendingPermissions }
    : null;

  return (
    <div className="space-y-6 text-left w-full">
      {grantModalOpen && (
        <GrantAssessorModal 
          isOpen={grantModalOpen} 
          onClose={() => setGrantModalOpen(false)} 
          facultyUser={grantingTargetWithPerms} 
          type={grantModalType} 
          onConfirmGrant={handleConfirmGrant}
          initialPages={pendingPermissions.pages}
          initialFeatures={pendingPermissions.features}
        />
      )}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
        
        {/* Search and filters row */}
        <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 w-full">
          {/* Search matches name or department */}
          <div className="relative flex items-center h-10 w-full sm:w-64 md:w-72 px-3 bg-white border border-slate-300 rounded-lg shadow-xs shrink-0 transition-all hover:border-slate-400 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search faculty by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-2 bg-transparent text-slate-900 border-none outline-none focus:ring-0 focus:outline-none"
            />
            {searchQuery && (
              <X 
                className="h-3.5 w-3.5 text-slate-400 hover:text-red-500 cursor-pointer shrink-0 ml-1 transition-colors" 
                onClick={() => setSearchQuery('')}
                title="Clear search"
              />
            )}
          </div>

          {/* Institution Dropdown */}
          <div className="w-full sm:w-[210px] shrink-0 relative z-30">
            <SearchableDropdown
              options={INSTITUTION_OPTIONS}
              value={selectedInstitution}
              onChange={setSelectedInstitution}
              placeholder="Search institution..."
              isMulti={false}
            />
          </div>
        </div>

        {loadingFaculty ? (
          <div className="p-10 text-center text-slate-400 italic text-xs">Loading faculty list...</div>
        ) : (
          <>
            {/* Mobile/Tablet Card list */}
            <div className="lg:hidden space-y-4">
              {paginatedUsers.map((user) => {
                  return (
                    <div key={user.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
                      <div>
                        <p 
                          className="font-bold text-slate-800 text-xs cursor-pointer hover:underline inline-flex items-center gap-1.5"
                          onClick={() => handleFacultyClick(user.id)}
                        >
                          <span>{user.name}</span>
                          {user.isAdmin && (
                            <span className="text-[8px] px-1 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold uppercase leading-none">
                              Admin
                            </span>
                          )}
                        </p>
                        {user.isTemporaryAdmin && user.assignedBy && (
                          <span className="text-[10px] font-semibold text-indigo-650 block mt-1">
                            Assigned by: {user.assignedBy}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-655 space-y-1">
                        <p><strong className="font-semibold">Department:</strong> {user.department}</p>
                        <p><strong className="font-semibold">Institution:</strong> {user.institution || '—'}</p>
                      </div>
                      <div className="pt-2">
                        {user.isAdmin ? (
                          <div className="w-full py-2 text-xs font-bold rounded-lg text-center bg-blue-50/50 text-blue-700 border border-blue-200/60">
                            Administrator
                          </div>
                        ) : user.isTemporaryAdmin ? (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => handleEditAccess(user.id)}
                              className="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 shadow-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              <Settings className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                handleRevoke(user.id);
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
                            onClick={() => handleEditAccess(user.id)}
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
              <table className="w-full border-collapse text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest font-extrabold text-xs border-b border-slate-200">
                    <th className="p-4 text-left">Faculty Member</th>
                    <th className="p-4 text-left">Department</th>
                    <th className="p-4 text-left">Institution</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((user) => {
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-800">
                             <p 
                               className="font-bold text-slate-800 text-sm cursor-pointer hover:underline inline-flex items-center gap-1.5"
                               onClick={() => handleFacultyClick(user.id)}
                             >
                               <span>{user.name}</span>
                               {user.isAdmin && (
                                 <span className="text-[8px] px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold uppercase leading-none">
                                   Admin
                                 </span>
                               )}
                             </p>
                             {user.isTemporaryAdmin && user.assignedBy && (
                               <span className="text-[10px] font-semibold text-indigo-650 block mt-1">
                                 Assigned by: {user.assignedBy}
                               </span>
                             )}
                          </td>
                          <td className="p-4">
                            <p className="text-slate-700">{user.department}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-slate-700 font-medium">{user.institution || '—'}</p>
                          </td>
                          <td className="p-4 text-center">
                            {user.isAdmin ? (
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50/50 text-blue-700 border border-blue-200/65">
                                Administrator
                              </span>
                            ) : user.isTemporaryAdmin ? (
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleEditAccess(user.id)}
                                  className="px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 shadow-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
                                >
                                  <Settings className="h-3 w-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => {
                                    handleRevoke(user.id);
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
                                onClick={() => handleEditAccess(user.id)}
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
          </>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-platinum-silver/45 bg-pure-white px-4 py-4 sm:px-6 mt-4 rounded-b-xl">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <p className="text-sm text-slate-gray font-medium">
                Showing <span className="font-bold text-charcoal">{totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-bold text-charcoal">{Math.min(currentPage * itemsPerPage, totalItems)}</span>{' '}
                of <span className="font-bold text-charcoal">{totalItems}</span> results
              </p>
              <nav className="isolate inline-flex -space-x-px rounded-xl shadow-xs" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center rounded-l-xl px-2 py-2 text-slate-gray ring-1 ring-inset ring-platinum-silver hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed bg-pure-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const p = idx + 1;
                  if (totalPages > 7 && (p < currentPage - 2 || p > currentPage + 2) && p !== 1 && p !== totalPages) {
                    if (p === 2 || p === totalPages - 1) return <span key={p} className="relative inline-flex items-center px-4 py-2 text-sm font-bold text-charcoal ring-1 ring-inset ring-platinum-silver bg-pure-white">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-bold transition-colors ${
                        p === currentPage
                          ? 'z-10 bg-charcoal text-pure-white shadow-sm ring-1 ring-inset ring-charcoal'
                          : 'text-charcoal bg-pure-white ring-1 ring-inset ring-platinum-silver hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center rounded-r-xl px-2 py-2 text-slate-gray ring-1 ring-inset ring-platinum-silver hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed bg-pure-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center rounded-xl border border-platinum-silver bg-pure-white px-4 py-2 text-sm font-bold text-charcoal hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="relative ml-3 inline-flex items-center rounded-xl border border-platinum-silver bg-pure-white px-4 py-2 text-sm font-bold text-charcoal hover:bg-slate-50 disabled:opacity-50"
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
