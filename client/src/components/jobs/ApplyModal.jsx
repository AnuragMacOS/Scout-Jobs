import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { applyToJob } from '../../api/applications';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';

export default function ApplyModal({
  isOpen,
  onClose,
  job,
  onSuccess,
}) {
  const { user } = useAuth();
  const [selectedResumeId, setSelectedResumeId] = useState(
    user?.resumes?.[0]?.id || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!job) return null;

  const resumes = user?.resumes || [];

  const handleApply = async () => {
    setError('');
    setLoading(true);
    try {
      await applyToJob({
        jobId: job.id,
        resumeId: selectedResumeId || null,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Application"
      description={`Apply for ${job.title} at ${job.companyName}`}
      footer={
        success ? null : (
          <>
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={loading}
              onClick={handleApply}
            >
              Confirm & Submit
            </Button>
          </>
        )
      }
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-ink">Application Submitted!</h4>
          <p className="text-xs text-ink-muted max-w-xs mx-auto">
            Your application for <strong>{job.companyName}</strong> has been received and added to your dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Job Overview Pill Card */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg border border-border dark:border-zinc-700 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-ink dark:text-white">{job.title}</p>
              <p className="text-xs text-ink-muted dark:text-zinc-400 mt-0.5">
                {job.companyName} • {job.location}
              </p>
            </div>
            <Badge variant="accent" size="sm">
              {job.jobType === 'SIX_MONTH_INTERN_FTE'
                ? '6M + FTE'
                : job.jobType === 'FTE'
                ? 'Full Time'
                : job.jobType === 'INTERN'
                ? 'Internship'
                : job.jobType || 'Full Time'}
            </Badge>
          </div>

          {/* Student Profile Confirmation */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-zinc-400">
              Applicant Details
            </label>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-border dark:border-zinc-700 rounded-md text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-zinc-400">Name:</span>
                <span className="font-semibold text-ink dark:text-zinc-100">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-zinc-400">Roll Number:</span>
                <span className="font-semibold text-ink dark:text-zinc-100">{user?.rollNo || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted dark:text-zinc-400">Email:</span>
                <span className="font-semibold text-ink dark:text-zinc-100">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Resume Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-zinc-400">
              Select Resume to Submit
            </label>

            {resumes.length > 0 ? (
              <div className="space-y-2">
                {resumes.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all ${
                      selectedResumeId === r.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                        : 'border-border dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="resumeChoice"
                        value={r.id}
                        checked={selectedResumeId === r.id}
                        onChange={() => setSelectedResumeId(r.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs font-bold text-ink dark:text-zinc-100">
                          Resume {r.slotNumber}: {r.originalFilename}
                        </p>
                        <p className="text-[11px] text-ink-muted dark:text-zinc-400">
                          Uploaded {new Date(r.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-ink-muted dark:text-zinc-400 space-y-2">
                <div className="flex items-start gap-2 text-ink dark:text-zinc-200">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    No PDF resumes uploaded yet. Your application will be submitted with your verified campus academic record. You can upload custom resumes later in <strong>Info & Resume</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
