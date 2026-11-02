import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchExternalJobs } from '../api/externalJobs';
import { useAuth } from '../hooks/useAuth';
import PageShell from '../components/layout/PageShell';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {
  Search,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Building2,
} from 'lucide-react';

function formatRelativeTime(isoString) {
  if (!isoString) return 'Recently';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    if (diffDays < 30) return `Posted ${diffDays} days ago`;
    return 'Posted 1 month ago';
  } catch {
    return 'Recently';
  }
}

function getCompanyInitial(name) {
  return (name?.[0] || 'C').toUpperCase();
}

export default function FindJobsPage() {
  const { isAuthenticated } = useAuth();

  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('Software Engineer in India');
  const [remote, setRemote] = useState('false');
  const [datePosted, setDatePosted] = useState('all');

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['externalJobs', activeQuery, remote, datePosted],
    queryFn: () =>
      searchExternalJobs({
        q: activeQuery,
        remote,
        datePosted,
      }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const jobs = data?.data || [];
  const source = data?.source || 'curated-preview';
  const loading = isLoading || isFetching;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryToSearch = searchInput.trim() || activeQuery || 'Software Engineer in India';
    setActiveQuery(queryToSearch);
  };

  const handleQuickTagClick = (tag) => {
    setSearchInput(tag);
    setActiveQuery(tag);
  };

  return (
    <PageShell>
      {/* Centered Heading */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Web Search Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-white">
          Find Jobs Across the Web
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-zinc-400 mt-1.5 max-w-xl mx-auto">
          Explore real-time tech and engineering openings from top companies across India
        </p>
      </div>

      {/* Guest Banner if not authenticated */}
      {!isAuthenticated && (
        <div className="max-w-3xl mx-auto mb-6 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-ink dark:text-zinc-100">
              Exploring public web job listings
            </p>
            <p className="text-xs text-ink-muted dark:text-zinc-400 mt-0.5">
              Sign in with your student email to unlock resume parsing, ATS matching, and campus drives.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/login?redirect=/find-jobs"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1"
            >
              <span>Sign in</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 text-xs font-medium text-ink dark:text-zinc-300 hover:text-ink-dark bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="max-w-xl mx-auto mb-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. SDE, React Developer, Backend Engineer, Bengaluru..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 shadow-sm transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-sm transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Suggested Quick Tags */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xl mx-auto mb-4">
        {['SDE', 'Frontend', 'Backend', 'Fullstack', 'Intern', 'Remote'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickTagClick(tag)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-ink-muted dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-ink dark:hover:text-white transition-colors cursor-pointer"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Compact Filters */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <select
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          className="text-xs font-medium py-1.5 px-3 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
        >
          <option value="all">Date: Any time</option>
          <option value="today">Past 24 hours</option>
          <option value="3days">Past 3 days</option>
          <option value="week">Past week</option>
          <option value="month">Past month</option>
        </select>

        <button
          type="button"
          onClick={() => setRemote(remote === 'true' ? 'false' : 'true')}
          className={`text-xs font-medium py-1.5 px-3 rounded-lg border transition-colors shadow-sm cursor-pointer ${
            remote === 'true'
              ? 'bg-blue-600 text-white border-blue-600 font-semibold'
              : 'bg-white dark:bg-zinc-900 text-ink dark:text-zinc-200 border-border dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          {remote === 'true' ? 'Remote: Yes ✓' : 'Remote only'}
        </button>

        {loading && (
          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium ml-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">Searching...</span>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-ink dark:text-white">
            Search Results
          </h2>
          {!loading && (
            <span className="text-xs font-semibold text-ink-muted dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {jobs.length} listings
            </span>
          )}
        </div>

        {/* Source indicator badge */}
        {!loading && jobs.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted dark:text-zinc-400">
            <span
              className={`w-2 h-2 rounded-full ${
                source === 'jsearch-live' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
              }`}
            />
            <span>
              {source === 'jsearch-live' ? 'Live Web Search' : 'Curated Tech Openings'}
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-6 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-center my-6">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-red-700 dark:text-red-400">
            Unable to fetch external jobs right now
          </h3>
          <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 mb-4">
            Network connection or search service issue. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Retry Search
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      {!loading && !isError && jobs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const applyLink = job.job_apply_link || job.job_google_link || '#';
            const locationStr =
              job.job_city && job.job_state
                ? `${job.job_city}, ${job.job_state}`
                : job.job_city || job.job_location || job.job_country || 'India';

            return (
              <div
                key={job.job_id || job.job_title + (job.employer_name || '')}
                className="group bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:ring-1 hover:ring-blue-500/20 rounded-xl p-5 shadow-xs hover:shadow-lg hover:shadow-zinc-950/[0.06] hover:-translate-y-0.5 transition-all duration-200 ease-out flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      {job.employer_logo ? (
                        <img
                          src={job.employer_logo}
                          alt={job.employer_name || 'Employer'}
                          className="w-11 h-11 rounded-lg object-contain border border-border dark:border-zinc-700 bg-white p-1 shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-300 dark:group-hover:border-zinc-600 group-hover:bg-zinc-200/50 dark:group-hover:bg-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-900 dark:text-zinc-100 shrink-0 transition-colors ${
                          job.employer_logo ? 'hidden' : 'flex'
                        }`}
                      >
                        {getCompanyInitial(job.employer_name)}
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-ink dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {job.job_title}
                        </h3>
                        <p className="text-xs text-ink-muted dark:text-zinc-400 flex items-center gap-1.5 mt-1">
                          <span className="font-semibold text-ink dark:text-zinc-200 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-zinc-400" />
                            {job.employer_name || 'Hiring Company'}
                          </span>
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

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted dark:text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatRelativeTime(job.job_posted_at_datetime_utc || job.job_posted_at)}</span>
                  </div>

                  <a
                    href={applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm cursor-pointer"
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
      {!loading && !isError && jobs.length === 0 && (
        <EmptyState
          title="No live jobs found"
          description="Try modifying your search query or location keywords."
          actionText="Reset Search"
          onAction={() => {
            setSearchInput('');
            setActiveQuery('Software Engineer in India');
            setRemote('false');
            setDatePosted('all');
          }}
        />
      )}
    </PageShell>
  );
}
