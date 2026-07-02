/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FacultyDashboardCharts } from '../../components/charts/DashboardGrid';
import { useAuth } from '../../hooks/useAuth';
import { getPublications } from '../../services/publicationService';
import { ExportModal } from '../../components/common/ExportModal';
import { SearchableDropdown } from '../../components/common/SearchableDropdown';
import { Download } from 'lucide-react';

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

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [publications, setPublications] = useState([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState('All Institutions');

  useEffect(() => {
    getPublications().then(setPublications);
  }, []);

  // Filter publications by institution dynamically
  const adminPublications = publications.filter(p => {
    if (selectedInstitution === 'All Institutions') return true;

    // For older mock data without an institution, deterministically assign one
    let pubInstitution = p.institution;
    if (!pubInstitution) {
      const hash = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const mod = hash % 4;
      if (mod === 0) pubInstitution = 'SNSCT';
      else if (mod === 1) pubInstitution = 'SNSCE';
      else if (mod === 2) pubInstitution = 'SNSRCAS';
      else pubInstitution = 'SNSCAHS';
    }

    return pubInstitution === selectedInstitution;
  });

  const approvedCount = adminPublications.filter(p => p.status === 'Approved').length;
  const pendingCount = adminPublications.filter(p => p.status === 'Pending').length;

  // Publication count and revenue incorporate version/re-upload history
  const totalCount = adminPublications.reduce((sum, p) => sum + (p.versions ? p.versions.length : 1), 0);
  const totalRevenue = adminPublications
    .filter(p => p.paymentStatus === 'Paid')
    .reduce((sum, p) => sum + ((p.versions ? p.versions.length : 1) * 150), 0);

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-140px)] w-full">
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} publications={publications} />
      <div className="bg-linear-to-r from-frost-gray via-pure-white to-pure-white p-4 sm:p-6 md:p-8 rounded-2xl border border-platinum-silver text-left space-y-3 sm:space-y-4 shadow-xs relative overflow-visible animate-fade-in neon-grey-glow cursor-default transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-sans tracking-tight text-shine">
            Welcome back, <span className="inline-block">{currentUser.name}!</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-gray leading-relaxed max-w-3xl">
            Manage institutional publications, reviews, and evaluation workflows here.
          </p>
        </div>
        <div className="pt-2 flex flex-wrap gap-4 items-center justify-between w-full relative z-10">
          <div className="bg-white h-10 px-4 rounded-xl border border-platinum-silver flex items-center space-x-2 shadow-xs transition-all duration-300 hover:scale-105 hover:shadow-xs text-xs font-bold text-charcoal shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Role: <strong className="font-extrabold">Admin</strong></span>
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            <SearchableDropdown
              options={INSTITUTION_OPTIONS}
              value={selectedInstitution}
              onChange={setSelectedInstitution}
              placeholder="Search institution..."
              className="w-48 sm:w-64"
            />

            {(!currentUser.isTemporaryAdmin || currentUser.granularPermissions?.features?.includes('export_data')) && (
              <button
                onClick={() => setIsExportOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-xl border border-emerald-700 flex items-center space-x-2 shadow-sm transition-all duration-300 hover:scale-105 cursor-pointer shrink-0 text-xs font-bold"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Export Data</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow flex flex-col justify-between text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
          <span className="text-[9px] uppercase font-bold text-emerald-600">Approved</span>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-1">{approvedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow flex flex-col justify-between text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
          <span className="text-[9px] uppercase font-bold text-indigo-500">Total Revenue</span>
          <span className="text-2xl font-black font-mono text-indigo-500 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow flex flex-col justify-between text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
          <span className="text-[9px] uppercase font-bold text-amber-600">Pending</span>
          <span className="text-2xl font-black font-mono text-amber-600 mt-1">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow flex flex-col justify-between text-left transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-slate-300">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Total</span>
            <span className="text-[9px] uppercase font-bold text-slate-400 block mt-0.5">Publications</span>
          </div>
          <span className="text-2xl font-black font-mono text-slate-800 mt-1">{totalCount}</span>
        </div>
      </div>

      <div className="flex-1 min-h-100">
        <FacultyDashboardCharts publications={adminPublications} publicationStatuses={{ approved: approvedCount, pending: pendingCount }} />
      </div>
    </div>
  );
}
