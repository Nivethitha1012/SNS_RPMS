/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, X, Search } from 'lucide-react';
import { GrantAssessorModal } from '../../components/assignAccess/AssignAccessModal';

export const AssignAccessPage = ({
  currentUser,
  users,
  grantTemporaryAdmin,
  revokeTemporaryAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantingTargetUserId, setGrantingTargetUserId] = useState(null);
  const [grantModalType, setGrantModalType] = useState('granted');

  const handleConfirmGrant = (userId, permissions) => {
    grantTemporaryAdmin(userId, permissions);
  };

  const filteredUsers = Object.values(users).filter(u => {
    if (u.role !== 'Faculty') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
  });

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
        
        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-charcoal sm:text-sm transition-colors"
            placeholder="Search faculty by name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Mobile/Tablet Card list */}
        <div className="lg:hidden space-y-4">
          {filteredUsers.map((user) => {
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
                    <button
                      onClick={() => {
                        if (user.isTemporaryAdmin) {
                          revokeTemporaryAdmin(user.id);
                          setGrantingTargetUserId(user.id);
                          setGrantModalType('revoked');
                          setGrantModalOpen(true);
                        } else {
                          setGrantingTargetUserId(user.id);
                          setGrantModalType('granted');
                          setGrantModalOpen(true);
                        }
                      }}
                      className={`w-full py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 shadow-sm ${user.isTemporaryAdmin
                           ? 'bg-red-50 text-red-650 hover:bg-red-100/80'
                           : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                    >
                      {user.isTemporaryAdmin ? (
                        <>
                          <X className="h-3 w-3" />
                          <span>Revoke Privilege</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3 w-3" />
                          <span>Grant Assessor Role</span>
                        </>
                      )}
                    </button>
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
              {filteredUsers.map((user) => {
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
                        <button
                          onClick={() => {
                            if (user.isTemporaryAdmin) {
                              revokeTemporaryAdmin(user.id);
                              setGrantingTargetUserId(user.id);
                              setGrantModalType('revoked');
                              setGrantModalOpen(true);
                            } else {
                              setGrantingTargetUserId(user.id);
                              setGrantModalType('granted');
                              setGrantModalOpen(true);
                            }
                          }}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center mx-auto space-x-1 shadow-sm ${user.isTemporaryAdmin
                              ? 'bg-red-50 text-red-650 hover:bg-red-100/80'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                          {user.isTemporaryAdmin ? (
                            <>
                              <X className="h-3 w-3" />
                              <span>Revoke Privilege</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3 w-3" />
                              <span>Grant Assessor Role</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
