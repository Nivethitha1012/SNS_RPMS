/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import { Modal } from '../../components/Modal';
import { assignMainAdmin, revokeMainAdmin } from '../../services/assignRoleService';
import { useAuth } from '../../hooks/useAuth';
import { fetchDeveloperFacultyList } from '../../api/developerApi';
import { INSTITUTION_OPTIONS, INSTITUTION_MAP } from '../../utils/constants';
import config from '../../config';

export const AssignRolePage = () => {
  const { currentUser } = useAuth();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('All Institutions');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, userId: null, action: null });
  const [landingPageEnabled, setLandingPageEnabled] = useState(true);

  const loadFaculty = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let branchId = undefined;
      if (selectedInstitution !== 'All Institutions') {
        const instIndex = INSTITUTION_OPTIONS.indexOf(selectedInstitution);
        if (instIndex > 0) branchId = instIndex.toString();
      }
      const data = await fetchDeveloperFacultyList(currentPage, itemsPerPage, branchId, undefined, searchQuery);
      setUsersList((data.faculties || []).map(u => ({
        ...u,
        institution: INSTITUTION_MAP[u.institution] || u.institution || ''
      })));
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error('[AssignRole] Failed to load faculty:', err);
      setError('Failed to load faculty list.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedInstitution, searchQuery]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/developer/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('rpms_token')}`
        },
        credentials: 'include'
      });
      const resData = await response.json();
      if (resData.success) {
        setLandingPageEnabled(resData.data.landing_page_enabled);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const toggleLandingPage = async () => {
    const newValue = !landingPageEnabled;
    setLandingPageEnabled(newValue);
    try {
      const response = await fetch(`${config.apiBaseUrl}/developer/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('rpms_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ key: 'landing_page_enabled', value: newValue ? 'true' : 'false' })
      });
      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.message);
      }
    } catch (err) {
      console.error('Failed to update setting:', err);
      setLandingPageEnabled(!newValue); // revert
      alert('Failed to save setting change.');
    }
  };

  useEffect(() => {
    loadFaculty();
    loadSettings();
  }, [loadFaculty]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedInstitution]);

  const confirmAction = async () => {
    const { userId, action } = confirmModalState;
    try {
      if (action === 'assign') await assignMainAdmin(userId);
      else if (action === 'revoke') await revokeMainAdmin(userId);
      await loadFaculty();
    } catch (err) {
      console.error('Failed to change role:', err);
      alert('Failed to update role. Check console for details.');
    } finally {
      setConfirmModalState({ isOpen: false, userId: null, action: null });
    }
  };

  const handleAssign = (userId) => setConfirmModalState({ isOpen: true, userId, action: 'assign' });
  const handleRevoke = (userId) => setConfirmModalState({ isOpen: true, userId, action: 'revoke' });

  const paginatedUsers = usersList.filter((u) => u.user_id !== currentUser?.id);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-6 text-left w-full">
      {/* System Settings Block */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-left transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System Configuration</h3>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <h4 className="text-xs font-bold text-slate-700">Landing Page Feature</h4>
            <p className="text-xs text-slate-500 mt-1">If enabled, the landing page will load first. If disabled, users are routed directly to the Sign-in portal.</p>
          </div>
          <button
            onClick={toggleLandingPage}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              landingPageEnabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                landingPageEnabled ? 'translate-x-6' : 'translate-x-1'
              } shadow-sm`}
            />
          </button>
        </div>
      </div>

      <Modal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState({ isOpen: false, userId: null, action: null })}
        title={confirmModalState.action === 'assign' ? 'Assign Main Admin' : 'Revoke Main Admin'}
        icon={confirmModalState.action === 'assign' ? ShieldCheck : X}
        maxWidthClass="max-w-md"
        footerActions={
          <>
            <button
              onClick={() => setConfirmModalState({ isOpen: false, userId: null, action: null })}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm ${
                confirmModalState.action === 'assign'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Confirm
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {confirmModalState.action === 'assign'
            ? 'Are you sure you want to assign the Main Admin role to this user? They will gain full administrative privileges.'
            : 'Are you sure you want to revoke the Main Admin role from this user? They will lose all administrative access.'}
        </p>
      </Modal>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md">

        {/* Search and filters row */}
        <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 w-full">
          <div className="relative flex items-center h-10 w-full sm:w-64 md:w-72 px-3 bg-white border border-slate-300 rounded-lg shadow-xs shrink-0 transition-all hover:border-slate-400 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search user by name or department..."
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

        {loading ? (
          <div className="p-10 text-center text-slate-400 italic text-xs animate-pulse">Loading faculty list...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-400 italic text-xs">{error}</div>
        ) : (
          <>
            {/* Mobile/Tablet Card list */}
            <div className="lg:hidden space-y-4">
              {paginatedUsers.map((user) => (
                <div key={user.user_id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
                  <p className="font-bold text-slate-800 text-xs">{user.name}</p>
                  <div className="text-[11px] text-slate-655 space-y-2">
                    <p><strong className="font-semibold">Department:</strong> {user.department || '—'}</p>
                    <p><strong className="font-semibold">Institution:</strong> {user.institution || '—'}</p>
                    <div className="flex items-center gap-2">
                      <strong className="font-semibold">Role:</strong>
                      <select
                        value={user.role?.toLowerCase() === 'admin' ? 'admin' : 'faculty'}
                        onChange={(e) => {
                          if (e.target.value === 'admin') handleAssign(user.user_id);
                          else handleRevoke(user.user_id);
                        }}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded p-1 outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {paginatedUsers.length === 0 && (
                <div className="p-10 text-center text-slate-400 italic text-xs">No users found.</div>
              )}
            </div>

            {/* Desktop view table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest font-extrabold text-xs border-b border-slate-200">
                    <th className="p-4 w-1/4 text-left">User Name</th>
                    <th className="p-4 w-1/3 text-left">Department</th>
                    <th className="p-4 w-1/3 text-left">Institution</th>
                    <th className="p-4 w-1/12 text-left">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">
                        <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-700">{user.department || '—'}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-700 font-medium">{user.institution || '—'}</p>
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role?.toLowerCase() === 'admin' ? 'admin' : 'faculty'}
                          onChange={(e) => {
                            if (e.target.value === 'admin') handleAssign(user.user_id);
                            else handleRevoke(user.user_id);
                          }}
                          className={`px-2 py-1 border rounded text-[11px] font-bold outline-none cursor-pointer ${
                            user.role?.toLowerCase() === 'admin'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 focus:border-emerald-500'
                              : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-slate-400'
                          }`}
                        >
                          <option value="faculty">Faculty</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-10 text-center text-slate-400 italic text-xs">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-platinum-silver/45 bg-pure-white px-4 py-4 sm:px-6 mt-4">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-gray font-medium">
                    Showing{' '}
                    <span className="font-bold text-charcoal">
                      {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-bold text-charcoal">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{' '}
                    of <span className="font-bold text-charcoal">{totalItems}</span> results
                  </p>
                  <nav className="isolate inline-flex -space-x-px rounded-xl shadow-xs" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center rounded-l-xl px-2 py-2 text-slate-gray ring-1 ring-inset ring-platinum-silver hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed bg-pure-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const p = idx + 1;
                      if (totalPages > 7 && (p < currentPage - 2 || p > currentPage + 2) && p !== 1 && p !== totalPages) {
                        if (p === 2 || p === totalPages - 1)
                          return (
                            <span key={p} className="relative inline-flex items-center px-4 py-2 text-sm font-bold text-charcoal ring-1 ring-inset ring-platinum-silver bg-pure-white">
                              ...
                            </span>
                          );
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="relative inline-flex items-center rounded-r-xl px-2 py-2 text-slate-gray ring-1 ring-inset ring-platinum-silver hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed bg-pure-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center rounded-xl border border-platinum-silver bg-pure-white px-4 py-2 text-sm font-bold text-charcoal hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="relative ml-3 inline-flex items-center rounded-xl border border-platinum-silver bg-pure-white px-4 py-2 text-sm font-bold text-charcoal hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
