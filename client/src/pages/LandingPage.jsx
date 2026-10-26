import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../api/jobs';
import { ArrowRight, Globe } from 'lucide-react';
import JobTypeBadge from '../components/jobs/JobTypeBadge';

export default function LandingPage() {
  const [featuredJobs, setFeaturedJobs] = useState([]);

  useEffect(() => {
    async function loadSample() {
      try {
        const data = await getJobs();
        setFeaturedJobs((data.jobs || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load preview jobs:', err);
      }
    }
    loadSample();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0d12] transition-colors">
      {/* Ariakit-Style Centered Hero Section */}
      <section className="grid justify-items-center gap-8 px-4 sm:px-6 md:gap-10 pt-16 sm:pt-20 md:pt-28 pb-12 sm:pb-16 max-w-5xl mx-auto">
        <div className="grid w-full max-w-4xl justify-items-center gap-6">
          <h1 className="text-pretty text-center text-4xl font-bold tracking-[-0.035em] text-ink dark:text-white sm:text-6xl sm:font-extrabold md:text-7xl dark:tracking-[-0.015em] leading-[1.08]">
            Job Application Platform
          </h1>
          <p className="max-w-[720px] text-pretty text-center text-lg text-ink-muted dark:text-zinc-400 md:text-xl md:leading-8 lg:text-2xl lg:leading-9 font-normal">
            Track verified recruitment drives, discover live engineering roles across India, and manage your pipeline in one clean workspace.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex max-w-[calc(100%-2rem)] flex-wrap items-center justify-center gap-4 mt-2">
          <Link
            to="/jobs"
            className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-6 sm:px-8 font-medium text-white text-base sm:text-lg shadow-xl shadow-blue-600/25 hover:bg-blue-700 transition-colors"
          >
            <span>Explore Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/find-jobs"
            className="group flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 font-medium text-ink dark:text-zinc-200 text-base sm:text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Globe className="w-4 h-4 text-ink-muted dark:text-zinc-400" />
            <span>Find Jobs Across Web</span>
          </Link>
        </div>
      </section>

      {/* Recent Openings Section - Direct clean grid without bulky wrapper */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight">
            Recent Openings
          </h2>
          <Link
            to="/jobs"
            className="group text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1.5 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* 2-column Preview Cards directly on clean background */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:ring-1 hover:ring-blue-500/20 rounded-xl p-5 shadow-xs hover:shadow-xl hover:shadow-zinc-950/[0.06] hover:-translate-y-1 transition-all duration-200 ease-out flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-ink dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs text-ink-muted dark:text-zinc-400 font-medium mt-0.5">
                      {job.companyName} • {job.location}
                    </p>
                  </div>
                  <JobTypeBadge jobType={job.jobType} />
                </div>

                {job.description && (
                  <p className="text-xs text-ink-muted dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {job.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                    Batch: {job.batchYear || '2027'}
                  </span>
                  <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                    CGPA: {job.minBtechCgpa ? `${job.minBtechCgpa}+` : '6.0+'}
                  </span>
                  {job.fteCtcLpa && (
                    <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      {job.fteCtcLpa} LPA
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-ink-muted dark:text-zinc-400">Direct Application</span>
                <Link
                  to="/jobs"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
