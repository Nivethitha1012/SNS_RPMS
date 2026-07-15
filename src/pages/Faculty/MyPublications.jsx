import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Eye, ArrowLeft, Download, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRangePicker } from '../../components/DateRangePicker';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import { getMyPublications, getPublicationDetail } from '../../services/publicationService';
import { downloadFromUrl } from '../../services/uploadService';
import { getAbsolutePdfUrl } from '../../api/apiClient';

export const PublicationsPage = ({
  currentUser,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [selectedPubId, setSelectedPubId] = useState(id || null);
  const [directFetchedPub, setDirectFetchedPub] = useState(null);
  const [fSearchText, setFSearchText] = useState('');
  const [fStatusFilter, setFStatusFilter] = useState('All statuses');
  const [fStartDate, setFStartDate] = useState('');
  const [fEndDate, setFEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [publications, setPublications] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const res = await getMyPublications({
        page: currentPage,
        limit: itemsPerPage,
        search: fSearchText,
        status: fStatusFilter,
        startDate: fStartDate,
        endDate: fEndDate
      });
      setPublications(res.publications || []);
      setTotalItems(res.total || 0);
    } catch (err) {
      console.error('[MyPublications] Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, [currentPage, fSearchText, fStatusFilter, fStartDate, fEndDate]);

  // Sync selectedPubId if url param 'id' changes
  useEffect(() => {
    if (id) {
      setSelectedPubId(id);
    } else {
      setSelectedPubId(null);
    }
  }, [id]);

  // Fetch details directly if not in currently loaded publications page
  useEffect(() => {
    if (selectedPubId) {
      const found = publications.find(p => p.id === selectedPubId);
      if (!found) {
        getPublicationDetail(selectedPubId)
          .then(pub => setDirectFetchedPub(pub))
          .catch(err => {
            console.error("Failed to load publication details:", err);
            navigate('/not-found', { replace: true });
          });
      } else {
        setDirectFetchedPub(null);
      }
    } else {
      setDirectFetchedPub(null);
    }
  }, [selectedPubId, publications, navigate]);

  const handleSelectPub = (pubId) => {
    setSelectedPubId(pubId);
    const prefix = location.pathname.startsWith('/admin') ? '/admin' : '/faculty';
    if (pubId) {
      navigate(`${prefix}/publication/${pubId}`);
    } else {
      navigate(`${prefix}/publications`);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [fSearchText, fStatusFilter, fStartDate, fEndDate]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedPubs = publications;

  const hasActiveFilters = fSearchText !== '' || fStatusFilter !== 'All' || fStartDate !== '' || fEndDate !== '';

  const handleClearFilters = () => {
    setFSearchText('');
    setFStatusFilter('All statuses');
    setFStartDate('');
    setFEndDate('');
  };

  return (
    <div className="space-y-6 w-full">
      {!selectedPubId ? (
        <>
          {/* Search and filters row */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-left animate-fade-in transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-slate-300 relative z-20">
            <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-start sm:items-center gap-3 w-full">
              {/* Search matches title or id */}
              <div className="relative flex sm:flex-1 items-center h-11 sm:h-9 w-full sm:max-w-md px-3 bg-white border border-slate-300 rounded-lg shadow-xs shrink-0 transition-all hover:border-slate-400 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by title"
                  value={fSearchText}
                  onChange={(e) => setFSearchText(e.target.value)}
                  className="w-full text-sm sm:text-xs pl-2 bg-transparent text-slate-900 border-none outline-none focus:ring-0 focus:outline-none"
                />
                {fSearchText && (
                  <X
                    className="h-3.5 w-3.5 text-slate-400 hover:text-red-500 cursor-pointer shrink-0 ml-1 transition-colors"
                    onClick={() => setFSearchText('')}
                    title="Clear search"
                  />
                )}
              </div>

              {/* Status */}
              <div className="w-full sm:w-[160px] shrink-0 relative z-30">
                <SearchableDropdown
                  options={['All statuses', 'Completed', 'Submitted']}
                  value={fStatusFilter}
                  onChange={setFStatusFilter}
                  placeholder="Status..."
                  isMulti={false}
                  showSearch={false}
                />
              </div>

              {/* Date Range Picker */}
              <div className="w-full sm:w-[210px] shrink-0 relative z-20">
                <DateRangePicker
                  startDate={fStartDate}
                  endDate={fEndDate}
                  onChange={({ startDate, endDate }) => {
                    setFStartDate(startDate);
                    setFEndDate(endDate);
                  }}
                />
              </div>

              {hasActiveFilters && (
                <div className="shrink-0 w-full sm:w-auto">
                  <button
                    onClick={handleClearFilters}
                    className="h-9 w-full sm:w-auto px-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 border border-slate-200 text-xs font-bold rounded-lg transition-colors text-center cursor-pointer flex items-center justify-center"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Publications listings (Responsive table & card views) */}
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-150 border-collapse text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest font-extrabold text-xs border-b border-slate-200">
                      <th className="p-4 text-center">S.No</th>
                      <th className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span>Publication</span>
                          <span>ID</span>
                        </div>
                      </th>
                      <th className="p-4 text-left">Title</th>
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
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400 italic">
                          Loading publications...
                        </td>
                      </tr>
                    ) : paginatedPubs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400 italic">
                          No results found.
                        </td>
                      </tr>
                    ) : (
                      paginatedPubs.map((pub, index) => (
                        <tr key={pub.id} className="hover:bg-slate-50/50 transition-colors font-sans py-3">
                          <td className="p-4 text-slate-400 text-center">{pub.sno}</td>
                          <td className="p-4 font-mono font-bold text-slate-400 text-center">{pub.id}</td>
                          <td className="p-4 max-w-sm text-left">
                            <span className="font-bold text-slate-900 block leading-snug">{pub.title}</span>
                          </td>
                          <td className="p-4 text-slate-400 text-center font-medium">
                            {pub.submissionDate ? new Date(pub.submissionDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 text-[9px] uppercase font-mono font-extrabold rounded-full ${pub.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                              pub.status === 'Submitted' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                              {pub.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 text-center font-medium">
                            {pub.status === 'Submitted' ? '-' : (pub.lastUpdated ? new Date(pub.lastUpdated).toLocaleDateString() : '-')}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleSelectPub(pub.id)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-pure-white border border-platinum-silver text-slate-gray hover:text-emerald-500 hover:border-emerald-200 hover:shadow-xs hover:bg-emerald-50 transition-all focus:outline-none mx-auto cursor-pointer"
                              title="View Publication"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
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
        </>
      ) : (
        <>
          <div className="flex justify-between items-center bg-pure-white p-5 rounded-2xl border border-platinum-silver shadow-xs text-left animate-fade-in">
            <button
              onClick={() => {
                handleSelectPub(null);
              }}
              className="px-4 py-2 text-xs font-bold text-charcoal bg-frost-gray hover:bg-mist-silver border border-platinum-silver rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to My Publications List</span>
            </button>
          </div>

          {/* Drilling down panel - publication detail card */}
          {(() => {
            const target = publications.find(p => p.id === selectedPubId) || directFetchedPub;
            if (!target) return <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm"><span className="text-sm font-bold text-slate-400 italic">Loading details...</span></div>;
            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm text-left animate-fade-in space-y-6">
                {/* Badges Row */}
                <div className="flex justify-between items-center w-full">
                  <span className="bg-white border border-slate-200 font-mono font-bold px-3 py-1.5 rounded-lg text-xs text-slate-700 shadow-3xs">
                    ID: {target.id}
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg text-xs uppercase font-mono font-extrabold shadow-3xs border ${target.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                    target.status === 'Submitted' ? 'bg-amber-50 text-amber-700 border-amber-250' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                    {target.status}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-sans font-black text-slate-900 text-2xl leading-tight tracking-tight pt-1 text-center w-full">
                  {target.title}
                </h3>

                {/* Faculty Name Prominently Displayed & Dates */}
                <div className="pt-4 pb-2 border-t border-slate-200 text-xs font-semibold text-slate-600 flex flex-col items-center">
                  <div className="flex flex-col space-y-2 items-start">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Faculty Author:</span>
                      <span className="text-slate-800 font-extrabold">{target.author || currentUser.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Category:</span>
                      <span className="text-slate-800 font-extrabold uppercase">{target.category || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Date of Submission:</span>
                      <span className="text-slate-800 font-extrabold">
                        {target.submissionDate ? new Date(target.submissionDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                    {target.lastUpdated && target.status === 'Completed' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Date Reviewed:</span>
                        <span className="text-slate-800 font-extrabold">
                          {new Date(target.lastUpdated).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Downloads Section */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex flex-col space-y-3">
                    {/* Faculty Document Slot — download from S3 URL */}
                    <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left w-full">
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 block">Faculty Upload</span>
                        <p className="text-xs font-bold text-slate-800 truncate">Manuscript PDF</p>
                      </div>
                      {target.manuscriptUrl ? (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                          <a
                            href={getAbsolutePdfUrl(target.manuscriptUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-4 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs active:scale-98 transition-all shrink-0 w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-700" />
                            <span>View Original</span>
                          </a>
                          <button
                            onClick={() => downloadFromUrl(target.manuscriptUrl, `Manuscript_${target.id}.pdf`)}
                            className="py-2 px-4 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs active:scale-98 transition-all shrink-0 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Download className="h-3.5 w-3.5 text-white" />
                            <span>Download Original</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No file available</span>
                      )}
                    </div>

                    {/* Show the Reviewed PDF if it exists */}
                    {target.status === 'Completed' && target.reviewUrl && (
                      <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left w-full">
                        <div className="flex-1 min-w-0">
                          <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 block">Dean Evaluation PDF</span>
                          <p className="text-xs font-bold text-slate-850 truncate">Reviewed Document</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                          <a
                            href={getAbsolutePdfUrl(target.reviewUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-4 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs active:scale-98 transition-all shrink-0 w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-700" />
                            <span>View Reviewed</span>
                          </a>
                          <button
                            onClick={() => downloadFromUrl(target.reviewUrl, `Review_${target.id}.pdf`)}
                            className="py-2 px-4 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs active:scale-98 transition-all shrink-0 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Download className="h-3.5 w-3.5 text-white" />
                            <span>Download Reviewed</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};
