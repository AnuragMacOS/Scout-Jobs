import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchExternalJobs } from '../api/externalJobs';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import PageShell from '../components/layout/PageShell';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {
  Search,
  ExternalLink,
  MapPin,
  Clock,
  Lock,
  ArrowRight,
} from 'lucide-react';

function formatRelativeTime(isoString) {
  if (!isoString) return 'Recently';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  } catch {
    return 'Recently';
  }
}

function getCompanyInitial(name) {
  return (name?.[0] || 'C').toUpperCase();
}

export default function FindJobsPage() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('Software Engineer in India');
  const [isLiveSearch, setIsLiveSearch] = useState(false);
  const [remote, setRemote] = useState('false');
  const [datePosted, setDatePosted] = useState('all');

  // TanStack Query enabled only when user is authenticated
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['externalJobs', activeQuery, remote, datePosted, isLiveSearch],
    queryFn: () =>
      searchExternalJobs({
        q: activeQuery,
        remote,
        datePosted,
        live: isLiveSearch ? 'true' : 'false',
      }),
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const jobs = data?.data || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to search live web jobs.', 'info');
      navigate('/login?redirect=/find-jobs', { state: { from: { pathname: '/find-jobs' } } });
      return;
    }
    if (searchInput.trim()) {
      setActiveQuery(searchInput.trim());
      setIsLiveSearch(true);
    }
  };

  const loading = isLoading || isFetching;

  return (
    <PageShell>
      {/* Centered Heading */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-white">
          Find Jobs Across the Web
        </h1>
        <p className="text-sm text-ink-muted dark:text-zinc-400 mt-1 max-w-xl mx-auto">
          Search live tech and engineering opportunities across India
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-xl mx-auto mb-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. SDE in India, React Developer, Backend Engineer..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-sm transition-colors shrink-0 flex items-center gap-1.5"
          >
            {!isAuthenticated && <Lock className="w-3.5 h-3.5 opacity-80" />}
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Compact Filters */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <select
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          disabled={!isAuthenticated}
          className="text-xs font-medium py-1.5 px-3 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-sm disabled:opacity-50"
        >
          <option value="all">Date: Any time</option>
          <option value="today">Past 24 hours</option>
          <option value="3days">Past 3 days</option>
          <option value="week">Past week</option>
          <option value="month">Past month</option>
        </select>

        <button
          type="button"
          disabled={!isAuthenticated}
          onClick={() => setRemote(remote === 'true' ? 'false' : 'true')}
          className={`text-xs font-medium py-1.5 px-3 rounded-lg border transition-colors shadow-sm disabled:opacity-50 ${
            remote === 'true'
              ? 'bg-blue-600 text-white border-blue-600 font-semibold'
              : 'bg-white dark:bg-zinc-900 text-ink dark:text-zinc-200 border-border dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          {remote === 'true' ? 'Remote: Yes ✓' : 'Remote only'}
        </button>
      </div>

      {/* Authentication Prompt for Unauthenticated Users */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-ink dark:text-white">
            Sign in to search live web jobs
          </h2>
          <p className="text-xs text-ink-muted dark:text-zinc-400 mt-2 mb-6 leading-relaxed">
            Searching live engineering openings across Indian job boards requires an active student or employer login.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/login?redirect=/find-jobs"
              state={{ from: { pathname: '/find-jobs' } }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              <span>Log in to search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2.5 text-xs font-semibold text-ink dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-ink dark:text-white flex items-center gap-2">
              <span>Search Results</span>
              {!loading && (
                <span className="text-xs font-semibold text-ink-muted dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  {jobs.length} listings
                </span>
              )}
            </h2>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width="44px" height="44px" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton height="16px" width="60%" />
                      <Skeleton height="12px" width="40%" />
                    </div>
                  </div>
                  <Skeleton height="36px" width="100%" />
                </div>
              ))}
            </div>
          )}

          {/* Jobs Grid */}
          {!loading && jobs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const applyLink = job.job_apply_link || job.job_google_link || '#';
                const locationStr =
                  job.job_city && job.job_state
                    ? `${job.job_city}, ${job.job_state}`
                    : job.job_city || job.job_country || 'India';

                return (
                  <div
                    key={job.job_id || job.job_title + job.employer_name}
                    className="group bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:ring-1 hover:ring-blue-500/20 rounded-xl p-5 shadow-xs hover:shadow-lg hover:shadow-zinc-950/[0.06] hover:-translate-y-1 transition-all duration-200 ease-out flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          {job.employer_logo ? (
                            <img
                              src={job.employer_logo}
                              alt={job.employer_name}
                              className="w-10 h-10 rounded-lg object-contain border border-border dark:border-zinc-700 bg-white p-1 shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-300 dark:group-hover:border-zinc-600 group-hover:bg-zinc-200/50 dark:group-hover:bg-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-900 dark:text-zinc-100 shrink-0 transition-colors ${
                              job.employer_logo ? 'hidden' : 'flex'
                            }`}
                          >
                            {getCompanyInitial(job.employer_name)}
                          </div>

                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-ink dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {job.job_title}
                            </h3>
                            <p className="text-xs text-ink-muted dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-ink dark:text-zinc-200">{job.employer_name}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-zinc-400" />
                                {locationStr}
                              </span>
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-900 dark:bg-zinc-700 text-white shrink-0">
                          {job.job_employment_type?.toUpperCase() || 'FULLTIME'}
                        </span>
                      </div>

                      {job.job_description && (
                        <p className="text-xs text-ink-muted dark:text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                          {job.job_description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted dark:text-zinc-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatRelativeTime(job.job_posted_at_datetime_utc)}</span>
                      </div>

                      <a
                        href={applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                      >
                        <span>Apply Direct</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && (
            <EmptyState
              title="No live jobs found"
              description="Try modifying your search query or location keywords."
            />
          )}
        </>
      )}
    </PageShell>
  );
}
