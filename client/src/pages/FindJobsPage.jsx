import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Building2,
  Lock,
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

const COUNTRY_NAME_MAP = {
  US: 'United States',
  USA: 'United States',
  AU: 'Australia',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  DE: 'Germany',
  JP: 'Japan',
  CA: 'Canada',
  SG: 'Singapore',
  IN: 'India',
  INDIA: 'India',
};

function formatJobLocation(job, activeCountry) {
  const countryCode = (job.job_country || '').toUpperCase();
  const countryName = COUNTRY_NAME_MAP[countryCode] || job.job_country;
  const city = job.job_city;
  const state = job.job_state;

  if (city && state && countryName) {
    return `${city}, ${state}, ${countryName}`;
  }
  if (city && countryName) {
    return `${city}, ${countryName}`;
  }
  if (city && state) {
    return `${city}, ${state}`;
  }
  if (city) {
    return city;
  }
  if (countryName) {
    return job.job_is_remote ? `${countryName} (Remote)` : countryName;
  }

  // Handle remote jobs where city and country are unspecified
  const isAnywhere = !job.job_location || job.job_location.toLowerCase().includes('anywhere');
  if (job.job_is_remote || isAnywhere) {
    if (activeCountry && activeCountry !== 'all' && COUNTRY_NAME_MAP[activeCountry.toUpperCase()]) {
      return `${COUNTRY_NAME_MAP[activeCountry.toUpperCase()]} (Remote)`;
    }
    const applyLink = (job.job_apply_link || '') + ' ' + (job.employer_website || '');
    if (applyLink.includes('.com.au') || applyLink.includes('-in-Remote,AU')) return 'Australia (Remote)';
    if (applyLink.includes('.co.uk') || applyLink.includes('-in-Remote,GB')) return 'United Kingdom (Remote)';
    if (applyLink.includes('.ca') || applyLink.includes('-in-Remote,CA')) return 'Canada (Remote)';
    if (applyLink.includes(',US') || applyLink.includes('-in-Remote,US') || applyLink.includes('ziprecruiter.com')) return 'United States (Remote)';
    return 'Global Remote';
  }

  return job.job_location || 'Global';
}

function getCompanyInitial(name) {
  return (name?.[0] || 'C').toUpperCase();
}

export default function FindJobsPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('Software Engineer');
  const [remote, setRemote] = useState('false');
  const [datePosted, setDatePosted] = useState('all');
  const [freshersOnly, setFreshersOnly] = useState('false');
  const [international, setInternational] = useState('false');
  const [country, setCountry] = useState('all');

  const [page, setPage] = useState(1);
  const [extraJobs, setExtraJobs] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset pagination when any filter changes
  useEffect(() => {
    setPage(1);
    setExtraJobs([]);
    setHasMore(true);
  }, [activeQuery, remote, datePosted, freshersOnly, international, country]);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['externalJobs', activeQuery, remote, datePosted, freshersOnly, international, country],
    queryFn: () =>
      searchExternalJobs({
        q: activeQuery,
        remote,
        datePosted,
        freshers: freshersOnly,
        international,
        country: international === 'true' ? country : undefined,
        page: 1,
      }),
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const initialJobs = data?.data || [];
  const loading = (isLoading || isFetching) && page === 1 && extraJobs.length === 0;

  // Combine initial query results with any loaded more pages (deduped by job_id)
  const jobs = React.useMemo(() => {
    const map = new Map();
    for (const j of initialJobs) {
      if (j?.job_id) map.set(j.job_id, j);
    }
    for (const j of extraJobs) {
      if (j?.job_id) map.set(j.job_id, j);
    }
    return Array.from(map.values());
  }, [initialJobs, extraJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryToSearch = searchInput.trim() || activeQuery || 'Software Engineer';
    setActiveQuery(queryToSearch);
  };

  const handleRefresh = async () => {
    if (isRefreshing || loading) return;
    setIsRefreshing(true);
    setPage(1);
    setExtraJobs([]);
    try {
      const res = await searchExternalJobs({
        q: activeQuery,
        remote,
        datePosted,
        freshers: freshersOnly,
        international,
        country: international === 'true' ? country : undefined,
        page: 1,
        refresh: 'true',
      });
      queryClient.setQueryData(
        ['externalJobs', activeQuery, remote, datePosted, freshersOnly, international, country],
        res
      );
    } catch (err) {
      console.error('Force refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await searchExternalJobs({
        q: activeQuery,
        remote,
        datePosted,
        freshers: freshersOnly,
        international,
        country: international === 'true' ? country : undefined,
        page: nextPage,
      });

      const newJobs = res?.data || [];
      if (newJobs.length === 0 || res?.hasMore === false) {
        setHasMore(false);
      }
      if (newJobs.length > 0) {
        setExtraJobs((prev) => [...prev, ...newJobs]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more jobs:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // If user is not authenticated, show a clean sign-in screen
  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-white">
            Find Jobs Across the Web
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-zinc-400 mt-1.5 max-w-xl mx-auto">
            Explore real-time tech and engineering openings from top companies.
          </p>
        </div>

        <div className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-ink dark:text-white mb-2">
            Sign in to search jobs
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-zinc-400 mb-6 leading-relaxed">
            Sign in with your student account to search live tech openings across the web, match ATS requirements, and track applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              to="/login?redirect=/find-jobs"
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 text-xs sm:text-sm font-medium text-ink dark:text-zinc-300 hover:text-ink-dark bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              Create account
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Centered Heading */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-white">
          Find Jobs Across the Web
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-zinc-400 mt-1.5 max-w-xl mx-auto">
          Explore real-time tech and engineering openings from top companies.
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
              placeholder="e.g. SDE, React Developer, Backend Engineer..."
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

      {/* Compact Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <select
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          className="text-xs font-medium py-1.5 px-3 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
        >
          <option value="all">Date: Any time</option>
          <option value="today">Past 24 hours</option>
          <option value="3days">Past 3 days</option>
          <option value="week">Past week</option>
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

        <button
          type="button"
          onClick={() => setFreshersOnly(freshersOnly === 'true' ? 'false' : 'true')}
          className={`text-xs font-medium py-1.5 px-3 rounded-lg border transition-colors shadow-sm cursor-pointer ${
            freshersOnly === 'true'
              ? 'bg-blue-600 text-white border-blue-600 font-semibold'
              : 'bg-white dark:bg-zinc-900 text-ink dark:text-zinc-200 border-border dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          {freshersOnly === 'true' ? 'Freshers: Yes ✓' : 'Freshers / Entry Level'}
        </button>

        <button
          type="button"
          onClick={() => {
            const next = international === 'true' ? 'false' : 'true';
            setInternational(next);
            if (next === 'false') setCountry('all');
          }}
          className={`text-xs font-medium py-1.5 px-3 rounded-lg border transition-colors shadow-sm cursor-pointer ${
            international === 'true'
              ? 'bg-blue-600 text-white border-blue-600 font-semibold'
              : 'bg-white dark:bg-zinc-900 text-ink dark:text-zinc-200 border-border dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          {international === 'true' ? 'Worldwide: Yes ✓' : 'Worldwide'}
        </button>

        {international === 'true' && (
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="text-xs font-medium py-1.5 px-3 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="all">Region: All Worldwide</option>
            <option value="au">Australia</option>
            <option value="jp">Japan</option>
            <option value="gb">United Kingdom</option>
            <option value="de">Germany / EU</option>
            <option value="us">United States</option>
            <option value="ca">Canada</option>
            <option value="sg">Singapore</option>
          </select>
        )}

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

        {!loading && jobs.length > 0 && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Check for newly posted openings"
            className="text-xs font-medium text-ink-muted hover:text-ink dark:text-zinc-400 dark:hover:text-white px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Checking...' : 'Check for newest'}</span>
          </button>
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
            const locationStr = formatJobLocation(job, international === 'true' ? country : 'in');

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

      {/* Load More Button */}
      {!loading && !isError && jobs.length > 0 && hasMore && (
        <div className="text-center mt-8 mb-8">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Loading more jobs...</span>
              </>
            ) : (
              <span>Load More Jobs</span>
            )}
          </button>
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
            setActiveQuery('Software Engineer');
            setRemote('false');
            setDatePosted('all');
            setFreshersOnly('false');
            setInternational('false');
            setCountry('all');
          }}
        />
      )}
    </PageShell>
  );
}
