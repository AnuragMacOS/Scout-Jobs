import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/layout/PageShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import JobTypeBadge from '../../components/jobs/JobTypeBadge';
import { useToast } from '../../components/ui/Toast';
import {
  getAdminPostings,
  updateJob,
  deleteJob,
} from '../../api/admin';
import {
  getJobApplicants,
  updateApplicationStatus,
} from '../../api/applications';
import {
  Briefcase,
  Users,
  PlusCircle,
  Trash2,
  FileText,
  Mail,
  Phone,
  Download,
} from 'lucide-react';

export default function MyPostingsPage() {
  const { showToast } = useToast();
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Applicants Modal State
  const [activeJobForApplicants, setActiveJobForApplicants] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPostings() {
      try {
        const data = await getAdminPostings();
        if (isMounted) setPostings(data.jobs || []);
      } catch (err) {
        console.error('Failed to fetch admin postings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPostings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await updateJob(job.id, { status: nextStatus });
      setPostings((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j))
      );
      showToast(`Opening is now ${nextStatus === 'open' ? 'active' : 'closed'}`, 'success');
    } catch {
      showToast('Failed to update job status.', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This cannot be undone.')) {
      return;
    }
    try {
      await deleteJob(jobId);
      setPostings((prev) => prev.filter((j) => j.id !== jobId));
      showToast('Job posting removed successfully', 'info');
    } catch {
      showToast('Failed to delete job posting.', 'error');
    }
  };

  const handleOpenApplicants = async (job) => {
    setActiveJobForApplicants(job);
    setApplicantsLoading(true);
    try {
      const data = await getJobApplicants(job.id);
      setApplicants(data.applicants || []);
    } catch {
      showToast('Failed to load applicants.', 'error');
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setStatusUpdatingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      showToast(`Applicant status updated to ${newStatus}`, 'success');
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <PageShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
            Employer Job Postings
          </h1>
          <p className="text-sm text-ink-muted dark:text-zinc-400 mt-1">
            Manage your campus postings, monitor incoming applications, and update review statuses.
          </p>
        </div>

        <Link to="/admin/post-job">
          <Button variant="primary" size="md" icon={PlusCircle}>
            Post New Job
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton height="80px" />
          <Skeleton height="80px" />
          <Skeleton height="80px" />
        </div>
      ) : postings.length > 0 ? (
        <div className="space-y-4">
          {postings.map((job) => (
            <div
              key={job.id}
              className="group bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:ring-1 hover:ring-blue-500/20 rounded-xl p-5 shadow-xs hover:shadow-lg hover:shadow-zinc-950/[0.06] hover:-translate-y-0.5 transition-all duration-200 ease-out flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-ink dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
                  <JobTypeBadge jobType={job.jobType} />
                  <Badge
                    variant={job.status === 'open' ? 'success' : 'danger'}
                    dot
                    size="sm"
                  >
                    {job.status === 'open' ? 'Active / Open' : 'Closed'}
                  </Badge>
                </div>

                <p className="text-xs text-ink-muted dark:text-zinc-400 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-ink dark:text-zinc-200">{job.companyName}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>Batch {job.batchYear}</span>
                  <span>•</span>
                  <span>
                    {job.fteCtcLpa
                      ? `${job.fteCtcLpa} LPA`
                      : `₹${job.internStipendMonthly}/mo`}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Users}
                  onClick={() => handleOpenApplicants(job)}
                >
                  Applicants ({job._count?.applications || 0})
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(job)}
                >
                  {job.status === 'open' ? 'Close Opening' : 'Reopen'}
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteJob(job.id)}
                  aria-label="Delete posting"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-xl shadow-card">
          <Briefcase className="w-10 h-10 text-ink-muted dark:text-zinc-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-ink dark:text-white">No postings yet</h3>
          <p className="text-xs text-ink-muted dark:text-zinc-400 mt-1 max-w-sm mx-auto mb-4">
            You haven't posted any campus recruitment opportunities.
          </p>
          <Link to="/admin/post-job">
            <Button variant="primary" size="sm">
              Create your first job posting
            </Button>
          </Link>
        </div>
      )}

      {/* Applicants List Modal */}
      {activeJobForApplicants && (
        <Modal
          isOpen={!!activeJobForApplicants}
          onClose={() => setActiveJobForApplicants(null)}
          title={`Applicants — ${activeJobForApplicants.title}`}
          description={`${activeJobForApplicants.companyName} • ${applicants.length} total applicant(s)`}
          maxWidth="max-w-3xl"
          footer={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveJobForApplicants(null)}
            >
              Done
            </Button>
          }
        >
          {applicantsLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton height="60px" />
              <Skeleton height="60px" />
            </div>
          ) : applicants.length > 0 ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {applicants.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-lg border border-border dark:border-zinc-800 bg-surface/50 dark:bg-zinc-800/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-ink dark:text-zinc-100">
                        {app.user.firstName} {app.user.lastName}
                      </h4>
                      <p className="text-xs text-ink-muted dark:text-zinc-400 mt-0.5 flex items-center gap-3 flex-wrap">
                        <span>Roll: <strong className="text-ink dark:text-zinc-200">{app.user.rollNo || 'N/A'}</strong></span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {app.user.email}
                        </span>
                        {app.user.mobile && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {app.user.mobile}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={app.status}
                        disabled={statusUpdatingId === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="text-xs font-semibold py-1 px-2.5 rounded-md border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-200 focus:outline-none focus:border-accent"
                      >
                        <option value="applied">Status: Applied</option>
                        <option value="shortlisted">Status: Shortlisted ✓</option>
                        <option value="rejected">Status: Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Academic info summary */}
                  {app.user.academicInfo && (
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-white dark:bg-zinc-900/80 rounded border border-border dark:border-zinc-800 text-xs">
                      <div>
                        <span className="text-ink-muted dark:text-zinc-400 block text-[11px]">CGPA</span>
                        <span className="font-bold text-ink dark:text-zinc-100">
                          {app.user.academicInfo.aggregateCgpa || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-ink-muted dark:text-zinc-400 block text-[11px]">Branch</span>
                        <span className="font-bold text-ink dark:text-zinc-100">
                          {app.user.academicInfo.branch || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-ink-muted dark:text-zinc-400 block text-[11px]">10th / 12th</span>
                        <span className="font-bold text-ink dark:text-zinc-100">
                          {app.user.academicInfo.tenthPercentage || 'N/A'}% / {app.user.academicInfo.twelfthPercentage || 'N/A'}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Resume details */}
                  {app.resume && (
                    <div className="flex items-center justify-between gap-3 text-xs p-2.5 rounded bg-white dark:bg-zinc-900/80 border border-border dark:border-zinc-800 text-ink-muted dark:text-zinc-400">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate">
                          Resume (Slot {app.resume.slotNumber}):{' '}
                          <strong className="text-ink dark:text-zinc-200 font-semibold">{app.resume.originalFilename}</strong>
                        </span>
                      </div>
                      <a
                        href={`/api/resumes/${app.resume.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-accent hover:underline shrink-0 text-xs"
                      >
                        <Download className="w-3 h-3" />
                        Download PDF
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-ink-muted dark:text-zinc-400">
              No students have applied to this job posting yet.
            </div>
          )}
        </Modal>
      )}
    </PageShell>
  );
}
