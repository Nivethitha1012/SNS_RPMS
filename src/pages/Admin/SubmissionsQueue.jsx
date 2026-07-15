/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Eye, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import { DateRangePicker } from '../../components/DateRangePicker';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSubmissionQueue } from '../../services/publicationService';

import { INSTITUTION_OPTIONS, INSTITUTION_MAP } from '../../utils/constants';

export const AdminQueuePage = ({
  currentUser,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [aSearchText, setASearchText] = useState('');
  const [aStatusFilter, setAStatusFilter] = useState('All statuses');
  const [aInstitutionFilter, setAInstitutionFilter] = useState(['All Institutions']);
  const [aStartDate, setAStartDate] = useState('');
  const [aEndDate, setAEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [publications, setPublications] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await getSubmissionQueue({
        page: currentPage,
        limit: itemsPerPage,
        search: aSearchText,
        status: aStatusFilter,
        institution: aInstitutionFilter,
        startDate: aStartDate,
        endDate: aEndDate
      });
      setPublications(res.publications || []);
      setTotalItems(res.total || 0);
    } catch (err) {
      console.error('[SubmissionsQueue] Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [currentPage, aSearchText, aStatusFilter, JSON.stringify(aInstitutionFilter), aStartDate, aEndDate]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [aSearchText, aStatusFilter, JSON.stringify(aInstitutionFilter), aStartDate, aEndDate]);

  const clearAdminFilters = () => {
    setASearchText('');
    setAStatusFilter('All statuses');
    setAInstitutionFilter(['All Institutions']);
    setAStartDate('');
    setAEndDate('');
  };

  const hasActiveFilters = aSearchText !== '' ||
    aStatusFilter !== 'All statuses' ||
    (aInstitutionFilter.length > 0 && !(aInstitutionFilter.length === 1 && aInstitutionFilter[0] === 'All Institutions')) ||
    aStartDate !== '' ||
    aEndDate !== '';

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedPubs = publications;

  return (
    <div className="space-y-6 w-full animate-fade-in">

      {/* Admin advanced filters block */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm text-left transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-slate-300 relative z-20 overflow-visible">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full">
          {/* Search matches title or authors */}
          <div className="relative flex items-center h-9 w-full sm:w-64 md:w-72 px-3 bg-white border border-slate-300 rounded-lg shadow-xs shrink-0 transition-all hover:border-slate-400 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by title or author name..."
              value={aSearchText}
              onChange={(e) => setASearchText(e.target.value)}
              className="w-full text-xs pl-2 bg-transparent text-slate-900 border-none outline-none focus:ring-0 focus:outline-none"
            />
            {aSearchText && (
              <X
                className="h-3.5 w-3.5 text-slate-400 hover:text-red-500 cursor-pointer shrink-0 ml-1 transition-colors"
                onClick={() => setASearchText('')}
                title="Clear search"
              />
            )}
          </div>

          {/* Status */}
          <div className="w-full sm:w-40 shrink-0">
            <SearchableDropdown
              options={['All statuses', 'Submitted', 'Completed']}
              value={aStatusFilter}
              onChange={setAStatusFilter}
              placeholder="Status"
              showSearch={false}
            />
          </div>

          {/* Institution */}
          <div className="w-full sm:w-[210px] shrink-0 relative z-30">
            <SearchableDropdown
              options={INSTITUTION_OPTIONS}
              value={aInstitutionFilter}
              onChange={setAInstitutionFilter}
              placeholder="Search institution..."
              isMulti={true}
            />
          </div>

          {/* Date Range Picker */}
          <div className="w-full sm:w-[210px] shrink-0 relative z-20">
            <DateRangePicker
              startDate={aStartDate}
              endDate={aEndDate}
              onChange={({ startDate, endDate }) => {
                setAStartDate(startDate);
                setAEndDate(endDate);
              }}
            />
          </div>

          {hasActiveFilters && (
            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={clearAdminFilters}
                className="h-9 w-full sm:w-auto px-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 border border-slate-200 text-xs font-bold rounded-lg transition-colors text-center cursor-pointer flex items-center justify-center"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active review workspace list router */}
      <div className="grid grid-cols-1 gap-6 relative z-10">
        {/* Render cumulative audit queue */}
        <div className="w-full bg-pure-white rounded-2xl border border-platinum-silver shadow-xs overflow-hidden font-sans">


          {/* Scrollable table wrapper */}
          <div className="overflow-x-auto w-full -webkit-overflow-scrolling-touch">
            <table className="w-full min-w-175 border-collapse text-left text-sm text-slate-gray">
              <thead>
                <tr className="text-xs text-slate-500 font-extrabold uppercase tracking-wider bg-slate-50 border-b border-platinum-silver/45">
                  <th className="px-6 py-4 text-left">S.No</th>
                  <th className="px-6 py-4 text-left">Publication ID</th>
                  <th className="px-6 py-4 text-left">Title</th>
                  <th className="px-6 py-4 text-left">Faculty Name</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Institution</th>
                  <th className="px-6 py-4 text-left">Uploaded Date</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Reviewed Date</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-slate-400 italic">
                      Loading queue data...
                    </td>
                  </tr>
                ) : paginatedPubs.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-slate-400 italic">
                      No results found.
                    </td>
                  </tr>
                ) : (
                  paginatedPubs.map((pub, index) => (
                    <tr key={pub.id} className="bg-pure-white border-b border-platinum-silver/45 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-charcoal text-left">{pub.sno}</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-gray text-left">{pub.id}</td>
                      <td className="px-6 py-4 font-bold text-charcoal text-left" title={pub.title}>{pub.title}</td>
                      <td className="px-6 py-4 font-bold text-charcoal text-left">{pub.author || 'N/A'}</td>
                      <td className="px-6 py-4 font-medium text-left">{pub.category || 'N/A'}</td>
                      <td className="px-6 py-4 font-medium text-left">
                        {pub.institution || 'N/A'}
                      </td>

                      <td className="px-6 py-4 font-medium text-left">{new Date(pub.submissionDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-left">
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-mono font-black rounded-full ${pub.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          pub.status === 'Submitted' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                          {pub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-left">
                        {pub.status === 'Submitted' ? '-' : new Date(pub.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              const prefix = location.pathname.startsWith('/faculty') ? '/faculty' : '/admin';
                              navigate(`${prefix}/evaluation/${pub.id}`, { state: { publication: pub } });
                            }}
                            className="text-slate-gray hover:text-charcoal bg-white border border-platinum-silver hover:bg-slate-50 p-2 rounded-xl transition-colors shadow-2xs inline-flex items-center justify-center"
                            title="Evaluate"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-platinum-silver/45 bg-pure-white px-4 py-4 sm:px-6">
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
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-bold transition-colors ${p === currentPage
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
        </div>
      </div>
    </div>
  );
};
