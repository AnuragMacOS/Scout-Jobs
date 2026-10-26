import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { changePassword } from '../../api/profile';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ChangePasswordCard() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">Password changed successfully!</span>
        </div>
      )}

      <Input
        label="Current Password"
        name="currentPassword"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        required
        value={formData.currentPassword}
        onChange={handleChange}
      />

      <Input
        label="New Password"
        name="newPassword"
        type="password"
        placeholder="Minimum 6 characters"
        icon={Lock}
        required
        value={formData.newPassword}
        onChange={handleChange}
      />

      <Input
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        required
        value={formData.confirmPassword}
        onChange={handleChange}
      />

      <div className="pt-2">
        <Button type="submit" variant="primary" size="md" loading={loading}>
          Update password
        </Button>
      </div>
    </form>
  );
}
