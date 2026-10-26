import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/layout/PageShell';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { postJob } from '../../api/admin';
import {
  Building2,
  MapPin,
  Briefcase,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function PostJobPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    location: '',
    title: '',
    jobType: 'FTE',
    batchYear: 2027,
    minBtechCgpa: '7.0',
    minTenthPct: '60',
    minTwelfthPct: '60',
    internStipendMonthly: '',
    fteCtcLpa: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        location: formData.location.trim(),
        title: formData.title.trim(),
        jobType: formData.jobType,
        batchYear: parseInt(formData.batchYear, 10),
        minBtechCgpa: formData.minBtechCgpa ? parseFloat(formData.minBtechCgpa) : null,
        minTenthPct: formData.minTenthPct ? parseFloat(formData.minTenthPct) : null,
        minTwelfthPct: formData.minTwelfthPct ? parseFloat(formData.minTwelfthPct) : null,
        internStipendMonthly: formData.internStipendMonthly
          ? parseInt(formData.internStipendMonthly, 10)
          : null,
        fteCtcLpa: formData.fteCtcLpa ? parseInt(formData.fteCtcLpa, 10) : null,
        description: formData.description.trim(),
      };

      await postJob(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to create job posting. Please check all fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Employer Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
            Post a new campus job
          </h1>
          <p className="text-sm text-ink-muted dark:text-zinc-400 mt-1">
            Create an official recruitment listing. It will immediately appear on the public dashboard for all eligible students.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">Job opening published successfully!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Redirecting to Dashboard...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-xl p-6 sm:p-8 shadow-card space-y-6">
          {/* Row 1: Company Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Company Name"
              name="companyName"
              placeholder="e.g. Bachatt"
              icon={Building2}
              required
              value={formData.companyName}
              onChange={handleChange}
            />
            <Input
              label="Location"
              name="location"
              placeholder="e.g. Gurugram / Remote"
              icon={MapPin}
              required
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {/* Row 2: Job Title & Job Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Job Title"
              name="title"
              placeholder="e.g. SDE / APM / UX"
              icon={Briefcase}
              required
              value={formData.title}
              onChange={handleChange}
            />
            <Select
              label="Job Type"
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              options={[
                { label: 'Full Time Employment (FTE)', value: 'FTE' },
                { label: '6-Month Intern + FTE', value: 'SIX_MONTH_INTERN_FTE' },
                { label: 'Summer Internship', value: 'INTERN' },
                { label: 'Pre-Placement Offer (PPO)', value: 'PPO' },
              ]}
            />
          </div>

          {/* Row 3: Batch Year & Min CGPA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Graduating Batch Year"
              name="batchYear"
              type="number"
              placeholder="2027"
              required
              value={formData.batchYear}
              onChange={handleChange}
            />
            <Input
              label="Min B.Tech CGPA"
              name="minBtechCgpa"
              type="number"
              step="0.01"
              placeholder="e.g. 7.5"
              value={formData.minBtechCgpa}
              onChange={handleChange}
              helperText="Cutoff for undergraduate eligibility"
            />
          </div>

          {/* Row 4: 10th & 12th Percentages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Min 10th Standard %"
              name="minTenthPct"
              type="number"
              step="0.1"
              placeholder="e.g. 70"
              value={formData.minTenthPct}
              onChange={handleChange}
            />
            <Input
              label="Min 12th Standard %"
              name="minTwelfthPct"
              type="number"
              step="0.1"
              placeholder="e.g. 70"
              value={formData.minTwelfthPct}
              onChange={handleChange}
            />
          </div>

          {/* Row 5: Intern Stipend & FTE CTC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Internship Stipend (₹ / month)"
              name="internStipendMonthly"
              type="number"
              placeholder="e.g. 50000"
              value={formData.internStipendMonthly}
              onChange={handleChange}
              helperText="Monthly stipend during internship period"
            />
            <Input
              label="FTE CTC (LPA)"
              name="fteCtcLpa"
              type="number"
              placeholder="e.g. 24"
              value={formData.fteCtcLpa}
              onChange={handleChange}
              helperText="Full time cost to company in Lakhs per annum"
            />
          </div>

          {/* Row 6: Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-zinc-400">
              Job Description & Roles Overview
            </label>
            <textarea
              name="description"
              rows={5}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide role expectations, technical responsibilities, interview process steps..."
              className="w-full text-xs sm:text-sm p-3 rounded-md border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-border dark:border-zinc-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Submit Job Posting
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
