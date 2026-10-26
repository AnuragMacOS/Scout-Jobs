import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getJobs } from '../api/jobs';
import { getMyApplications } from '../api/applications';
import PageShell from '../components/layout/PageShell';
import JobGrid from '../components/jobs/JobGrid';
import JobCard from '../components/jobs/JobCard';
import ApplyModal from '../components/jobs/ApplyModal';
import Skeleton from '../components/ui/Skeleton';
import { Search, Briefcase } from 'lucide-react';

export default function JobsPage() {
  const { isAuthenticated, isStudent } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [jobsData, appsData] = await Promise.all([
          getJobs(),
          isAuthenticated && isStudent ? getMyApplications().catch(() => ({ applications: [] })) : Promise.resolve({ applications: [] }),
        ]);
        if (isMounted) {
          setJobs(jobsData.jobs || []);
          setApplications(appsData.applications || []);
        }
      } catch (err) {
        console.error('Failed to load jobs data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isStudent]);

  const appliedJobMap = {};
  applications.forEach((app) => {
    appliedJobMap[app.jobId] = app;
  });

  const query = search.toLowerCase();
  const filteredJobs = jobs.filter((job) => {
    if (!query) return true;
    return (
      job.title.toLowerCase().includes(query) ||
      job.companyName.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  });

  return (
    <PageShell>
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
              Jobs
            </h1>
            {!loading && (
              <span className="text-xs font-normal text-ink-muted dark:text-zinc-400">
                ({filteredJobs.length} {filteredJobs.length === 1 ? 'listing' : 'listings'})
              </span>
            )}
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles, companies, or cities..."
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <JobGrid>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width="44px" height="44px" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton height="16px" width="50%" />
                  <Skeleton height="12px" width="30%" />
                </div>
              </div>
              <Skeleton height="36px" width="100%" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton height="24px" />
                <Skeleton height="24px" />
                <Skeleton height="24px" />
              </div>
            </div>
          ))}
        </JobGrid>
      )}

      {/* Grid */}
      {!loading && filteredJobs.length > 0 && (
        <JobGrid>
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              application={appliedJobMap[job.id]}
              isApplied={!!appliedJobMap[job.id]}
              onApply={(j) => setSelectedJobToApply(j)}
            />
          ))}
        </JobGrid>
      )}

      {/* Empty */}
      {!loading && filteredJobs.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-xl shadow-card">
          <Briefcase className="w-10 h-10 text-ink-muted dark:text-zinc-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-ink dark:text-white">No matching openings found</h3>
          <p className="text-xs text-ink-muted dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria.
          </p>
        </div>
      )}

      {selectedJobToApply && (
        <ApplyModal
          isOpen={!!selectedJobToApply}
          onClose={() => setSelectedJobToApply(null)}
          job={selectedJobToApply}
          onSuccess={() => {
            fetchApplications();
            fetchJobs();
          }}
        />
      )}
    </PageShell>
  );
}
