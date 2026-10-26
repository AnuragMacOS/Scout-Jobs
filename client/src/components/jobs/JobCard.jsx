import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/Toast';
import JobTypeBadge from './JobTypeBadge';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import {
  MapPin,
  GraduationCap,
  Award,
  Calendar,
  Briefcase,
  ArrowRight,
  CheckCircle,
  FileText,
} from 'lucide-react';

export default function JobCard({
  job,
  application,
  onApply,
  isApplied = false,
}) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getCompanyInitial = (name) => {
    return (name?.[0] || 'J').toUpperCase();
  };

  const formatStipend = (val) => {
    if (!val) return null;
    if (val >= 1000) {
      return `₹${Math.round(val / 1000)}k/mo`;
    }
    return `₹${val}/mo`;
  };

  const formatCtc = (val) => {
    if (!val) return null;
    return `${val} LPA`;
  };

  const getJobTypeLabel = (type) => {
    const map = {
      FTE: 'Full Time (FTE)',
      INTERN: 'Internship',
      SIX_MONTH_INTERN_FTE: '6M Intern + FTE',
      PPO: 'Pre-Placement (PPO)',
    };
    return map[type] || type || 'Full Time';
  };

  const handleApplyClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please sign in to apply for this role.', 'info');
      navigate('/login', { state: { from: { pathname: '/jobs' } } });
      return;
    }
    if (onApply) {
      onApply(job);
    }
  };

  const getApplicationStatusBadge = () => {
    if (!application && !isApplied) return null;
    const status = application?.status || 'applied';
    if (status === 'shortlisted') {
      return (
        <Badge variant="success" dot size="sm">
          Shortlisted ✓
        </Badge>
      );
    }
    if (status === 'rejected') {
      return (
        <Badge variant="danger" dot size="sm">
          Application Closed
        </Badge>
      );
    }
    return (
      <Badge variant="info" dot size="sm">
        Applied ✓
      </Badge>
    );
  };

  return (
    <>
      <div
        onClick={() => setDetailsOpen(true)}
        className="group bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:ring-1 hover:ring-blue-500/20 rounded-xl p-5 shadow-xs hover:shadow-lg hover:shadow-zinc-950/[0.06] hover:-translate-y-1 transition-all duration-200 ease-out flex flex-col justify-between cursor-pointer"
      >
        <div>
          {/* Header row: Company initial/logo + Title & location + Status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-300 dark:group-hover:border-zinc-600 group-hover:bg-zinc-200/50 dark:group-hover:bg-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-900 dark:text-zinc-100 shrink-0 transition-colors">
                {getCompanyInitial(job.companyName)}
              </div>
              <div>
                <h3 className="text-base font-bold text-ink dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-ink-muted dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-ink dark:text-zinc-200">{job.companyName}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    {job.location}
                  </span>
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <JobTypeBadge jobType={job.jobType} />
            </div>
          </div>

          {/* Compensation Pills */}
          <div className="flex items-center gap-2.5 my-3 py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 group-hover:border-zinc-300 dark:group-hover:border-zinc-600 transition-colors">
            {job.internStipendMonthly && (
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-ink-muted dark:text-zinc-400">Stipend:</span>
                <span className="text-xs sm:text-sm font-bold text-ink dark:text-zinc-100">
                  {formatStipend(job.internStipendMonthly)}
                </span>
              </div>
            )}
            {job.internStipendMonthly && job.fteCtcLpa && (
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
            )}
            {job.fteCtcLpa && (
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-ink-muted dark:text-zinc-400">CTC:</span>
                <span className="text-xs sm:text-sm font-bold text-ink dark:text-zinc-100">
                  {formatCtc(job.fteCtcLpa)}
                </span>
              </div>
            )}
          </div>

          {/* Eligibility Criteria */}
          <div className="flex flex-wrap items-center gap-2 my-3">
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
              Batch: {job.batchYear || '2027'}
            </span>
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
              Min CGPA: {job.minBtechCgpa ? `${job.minBtechCgpa}+` : '6.0+'}
            </span>
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
              10th/12th: {job.minTenthPct ? `${job.minTenthPct}%+` : '60%+'}
            </span>
          </div>

          {/* Job Description Preview */}
          {job.description && (
            <p className="text-xs text-ink-muted dark:text-zinc-400 line-clamp-2 mt-2 mb-1 leading-relaxed">
              {job.description}
            </p>
          )}
        </div>

        {/* Action Footer matching FindJobs clean design */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDetailsOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border dark:border-zinc-700 text-ink dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Details
          </button>

          {application || isApplied ? (
            <div onClick={(e) => e.stopPropagation()}>
              {getApplicationStatusBadge()}
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleApplyClick(e);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
            >
              <span>Apply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      <Modal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="max-w-xl"
        title={job.title}
        description={`${job.companyName} • ${job.location}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {(application || isApplied) && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Applied ✓
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
              {!application && !isApplied && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => {
                    setDetailsOpen(false);
                    handleApplyClick();
                  }}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-5 text-sm">
          {/* Key Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-50 dark:bg-zinc-850 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-ink-muted dark:text-zinc-400 uppercase font-semibold tracking-wider">
                  Employment Type
                </p>
                <p className="text-sm font-bold text-ink dark:text-white mt-0.5 truncate">
                  {getJobTypeLabel(job.jobType)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-ink-muted dark:text-zinc-400 uppercase font-semibold tracking-wider">
                  Graduating Batch
                </p>
                <p className="text-sm font-bold text-ink dark:text-white mt-0.5">
                  {job.batchYear}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-ink-muted dark:text-zinc-400 uppercase font-semibold tracking-wider">
                  Min B.Tech CGPA
                </p>
                <p className="text-sm font-bold text-ink dark:text-white mt-0.5">
                  ≥ {job.minBtechCgpa || 6.0} CGPA
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-ink-muted dark:text-zinc-400 uppercase font-semibold tracking-wider">
                  Package / Stipend
                </p>
                <p className="text-sm font-bold text-ink dark:text-white mt-0.5">
                  {job.fteCtcLpa ? `${job.fteCtcLpa} LPA` : ''}
                  {job.fteCtcLpa && job.internStipendMonthly ? ' • ' : ''}
                  {job.internStipendMonthly ? formatStipend(job.internStipendMonthly) : ''}
                  {!job.fteCtcLpa && !job.internStipendMonthly ? 'Competitive' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-ink-muted dark:text-zinc-400" />
              <h4 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
                Job Description & Overview
              </h4>
            </div>
            <div className="text-xs text-ink dark:text-zinc-200 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-border dark:border-zinc-800">
              {job.description}
            </div>
          </div>

          {/* Academic Criteria Thresholds */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
                Eligibility Thresholds
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg border border-border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 flex flex-col justify-between">
                <span className="text-[11px] text-ink-muted dark:text-zinc-400 font-medium">B.Tech CGPA Cutoff</span>
                <span className="text-sm font-bold text-ink dark:text-white mt-1">≥ {job.minBtechCgpa || 6.0}</span>
              </div>
              <div className="p-3 rounded-lg border border-border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 flex flex-col justify-between">
                <span className="text-[11px] text-ink-muted dark:text-zinc-400 font-medium">10th Standard Cutoff</span>
                <span className="text-sm font-bold text-ink dark:text-white mt-1">≥ {job.minTenthPct || 60}%</span>
              </div>
              <div className="p-3 rounded-lg border border-border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 flex flex-col justify-between">
                <span className="text-[11px] text-ink-muted dark:text-zinc-400 font-medium">12th Standard Cutoff</span>
                <span className="text-sm font-bold text-ink dark:text-white mt-1">≥ {job.minTwelfthPct || 60}%</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
