import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { updateAcademic } from '../../api/profile';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function toAcademicData(data) {
  return {
    universityName: data?.universityName || '',
    yearOfGraduation: data?.yearOfGraduation || 2027,
    course: data?.course || 'B.Tech',
    branch: data?.branch || '',
    aggregateCgpa: data?.aggregateCgpa ?? '',
    tenthPercentage: data?.tenthPercentage ?? '',
    twelfthPercentage: data?.twelfthPercentage ?? '',
  };
}

export default function AcademicInfoForm({ initialData, onUpdated }) {
  const [formData, setFormData] = useState(() => toAcademicData(initialData));

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
    setSuccess(false);

    try {
      const payload = {
        universityName: formData.universityName.trim(),
        yearOfGraduation: formData.yearOfGraduation ? parseInt(formData.yearOfGraduation, 10) : null,
        course: formData.course.trim(),
        branch: formData.branch.trim(),
        aggregateCgpa: formData.aggregateCgpa ? parseFloat(formData.aggregateCgpa) : null,
        tenthPercentage: formData.tenthPercentage ? parseFloat(formData.tenthPercentage) : null,
        twelfthPercentage: formData.twelfthPercentage ? parseFloat(formData.twelfthPercentage) : null,
      };

      const res = await updateAcademic(payload);
      setSuccess(true);
      if (onUpdated) onUpdated(res.academicInfo);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update academic details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">Academic records updated successfully!</span>
        </div>
      )}

      {/* Row 1: University Name, Year of Grad, Course, Branch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="University Name"
          name="universityName"
          placeholder="e.g. Delhi Technological University"
          value={formData.universityName}
          onChange={handleChange}
        />
        <Input
          label="Year of Grad"
          name="yearOfGraduation"
          type="number"
          value={formData.yearOfGraduation}
          onChange={handleChange}
        />
        <Input
          label="Course"
          name="course"
          placeholder="e.g. B.Tech"
          value={formData.course}
          onChange={handleChange}
        />
        <Input
          label="Branch"
          name="branch"
          placeholder="e.g. Computer Engineering"
          value={formData.branch}
          onChange={handleChange}
        />
      </div>

      {/* Row 2: Aggregate CGPA, 10th %, 12th % */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Aggregate CGPA"
          name="aggregateCgpa"
          type="number"
          step="0.01"
          placeholder="e.g. 8.24"
          value={formData.aggregateCgpa}
          onChange={handleChange}
          helperText="Out of 10.0 scale"
        />
        <Input
          label="10th Percentage (%)"
          name="tenthPercentage"
          type="number"
          step="0.1"
          placeholder="e.g. 92.5"
          value={formData.tenthPercentage}
          onChange={handleChange}
        />
        <Input
          label="12th Percentage (%)"
          name="twelfthPercentage"
          type="number"
          step="0.1"
          placeholder="e.g. 88.0"
          value={formData.twelfthPercentage}
          onChange={handleChange}
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" variant="primary" size="md" loading={loading}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
