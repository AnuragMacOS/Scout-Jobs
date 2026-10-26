import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { updatePersonal } from '../../api/profile';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function toFormData(data) {
  return {
    firstName: data?.firstName || '',
    lastName: data?.lastName || '',
    email: data?.email || '',
    rollNo: data?.rollNo || '',
    gender: data?.gender || '',
    abcId: data?.abcId || '',
    mobile: data?.mobile || '',
    dateOfBirth: data?.dateOfBirth
      ? new Date(data.dateOfBirth).toISOString().split('T')[0]
      : '',
    graduationYear: data?.graduationYear || 2027,
  };
}

export default function PersonalInfoForm({ initialData, onUpdated }) {
  const [formData, setFormData] = useState(() => toFormData(initialData));

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
      const res = await updatePersonal(formData);
      setSuccess(true);
      if (onUpdated) onUpdated(res.user);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update personal details.');
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
          <span className="font-semibold">Personal details updated successfully!</span>
        </div>
      )}

      {/* Row 1: First Name, Last Name, Email, Roll No */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="First Name"
          name="firstName"
          required
          value={formData.firstName}
          onChange={handleChange}
        />
        <Input
          label="Last Name"
          name="lastName"
          required
          value={formData.lastName}
          onChange={handleChange}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          disabled
          value={formData.email}
          helperText="College email cannot be changed"
        />
        <Input
          label="Roll No"
          name="rollNo"
          value={formData.rollNo}
          onChange={handleChange}
        />
      </div>

      {/* Row 2: Gender, ABC ID, Mobile, Date of Birth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={[
            { label: 'Male', value: 'MALE' },
            { label: 'Female', value: 'FEMALE' },
            { label: 'Other', value: 'OTHER' },
          ]}
        />
        <Input
          label="ABC ID"
          name="abcId"
          placeholder="e.g. 123-456-789"
          value={formData.abcId}
          onChange={handleChange}
          helperText="Academic Bank of Credits"
        />
        <Input
          label="Mobile"
          name="mobile"
          placeholder="9876543210"
          value={formData.mobile}
          onChange={handleChange}
        />
        <Input
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />
      </div>

      {/* Row 3: Graduation Year */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Input
          label="Graduation Year"
          name="graduationYear"
          type="number"
          value={formData.graduationYear}
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
