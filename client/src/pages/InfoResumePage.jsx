import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import PersonalInfoForm from '../components/profile/PersonalInfoForm';
import AcademicInfoForm from '../components/profile/AcademicInfoForm';
import ResumeUploader from '../components/profile/ResumeUploader';
import ChangePasswordCard from '../components/profile/ChangePasswordCard';
import Skeleton from '../components/ui/Skeleton';
import { getProfile } from '../api/profile';
import { useAuth } from '../hooks/useAuth';
import { User, GraduationCap, KeyRound } from 'lucide-react';

export default function InfoResumePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = ['personal', 'academic', 'security'].includes(tabParam) ? tabParam : 'personal';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshUser } = useAuth();

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const data = await getProfile();
        if (isMounted) setProfile(data.profile);
      } catch {
        if (isMounted) {
          setProfile({
            firstName: '',
            lastName: '',
            email: '',
            rollNo: '',
            gender: '',
            mobile: '',
            graduationYear: 2027,
            academicInfo: {
              universityName: '',
              yearOfGraduation: 2027,
              course: 'B.Tech',
              branch: '',
              aggregateCgpa: '',
              tenthPercentage: '',
              twelfthPercentage: '',
            },
            resumes: [],
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handlePersonalUpdated = (updatedUser) => {
    setProfile((prev) => ({ ...prev, ...updatedUser }));
    refreshUser();
  };

  const handleAcademicUpdated = (updatedAcademic) => {
    setProfile((prev) => ({ ...prev, academicInfo: updatedAcademic }));
  };

  const handleResumesChange = (updatedResumes) => {
    setProfile((prev) => ({ ...prev, resumes: updatedResumes }));
    refreshUser();
  };

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
          My Info & Resume
        </h1>
        <p className="text-sm text-ink-muted dark:text-zinc-400 mt-1">
          Keep your personal records, degree marks, and resume documents up to date for campus recruiters.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton height="50px" width="300px" />
          <Skeleton height="260px" />
          <Skeleton height="220px" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Top Card: Personal & Academic Tabs */}
          <div className="bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-xl shadow-card overflow-hidden">
            {/* Tab Headers */}
            <div className="flex items-center border-b border-border dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 px-6 pt-3 gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('personal')}
                className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'personal'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-ink-muted dark:text-zinc-400 hover:text-ink dark:hover:text-zinc-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Personal</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('academic')}
                className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'academic'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-ink-muted dark:text-zinc-400 hover:text-ink dark:hover:text-zinc-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Academic</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('security')}
                className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-ink-muted dark:text-zinc-400 hover:text-ink dark:hover:text-zinc-200'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Security</span>
              </button>
            </div>

            {/* Tab Content Panel */}
            <div className="p-6 sm:p-8">
              {activeTab === 'personal' && (
                <PersonalInfoForm
                  key={profile?.id || 'personal'}
                  initialData={profile}
                  onUpdated={handlePersonalUpdated}
                />
              )}

              {activeTab === 'academic' && (
                <AcademicInfoForm
                  key={profile?.id || 'academic'}
                  initialData={profile?.academicInfo}
                  onUpdated={handleAcademicUpdated}
                />
              )}

              {activeTab === 'security' && <ChangePasswordCard />}
            </div>
          </div>

          {/* Bottom Card: Resume Uploader (Pinned below both tabs per Section 5.4) */}
          <div className="bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-xl p-6 sm:p-8 shadow-card">
            <ResumeUploader
              resumes={profile?.resumes || []}
              onResumesChange={handleResumesChange}
            />
          </div>
        </div>
      )}
    </PageShell>
  );
}
