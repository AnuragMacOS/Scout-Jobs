import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { getMyApplications, withdrawApplication } from '../api/applications';
import PageShell from '../components/layout/PageShell';
import Skeleton from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import {
  Briefcase,
  MoreHorizontal,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadApplications() {
      if (!isAuthenticated) {
        if (isMounted) {
          setApplications([]);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const data = await getMyApplications();
        if (isMounted) setApplications(data.applications || []);
      } catch (err) {
        console.error('Failed to load student applications:', err);
        if (isMounted) setApplications([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadApplications();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Close actions menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  const handleWithdraw = async (appId) => {
    try {
      await withdrawApplication(appId);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: 'withdrawn' } : a))
      );
      showToast('Application withdrawn successfully.', 'info');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to withdraw application.', 'error');
    } finally {
      setActiveMenuId(null);
    }
  };

  const renderStatusBadge = (status) => {
    const s = (status || 'applied').toUpperCase();
    if (s === 'SHORTLISTED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 tracking-wider">
          SHORTLISTED
        </span>
      );
    }
    if (s === 'WITHDRAWN') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-zinc-100 text-zinc-400 tracking-wider">
          WITHDRAWN
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-rose-50 text-rose-700 tracking-wider">
          REJECTED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-blue-100 text-blue-600 tracking-wider">
        APPLIED
      </span>
    );
  };

  return (
    <PageShell>
      {/* Header matching Screenshot */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
          My Job Applications
        </h1>
        <p className="text-xs text-ink-muted dark:text-zinc-400 mt-1">
          Track the status of all your job applications here.
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-xl shadow-xs overflow-visible">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton height="36px" width="100%" />
            <Skeleton height="48px" width="100%" />
            <Skeleton height="48px" width="100%" />
            <Skeleton height="48px" width="100%" />
          </div>
        ) : applications.length > 0 ? (
          <div className="overflow-visible">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                  <th className="py-3.5 px-4 sm:px-6 font-medium">Job Post</th>
                  <th className="py-3.5 px-4 sm:px-6 font-medium">Company</th>
                  <th className="py-3.5 px-4 sm:px-6 font-medium">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {applications.map((app) => {
                  const job = app.job || {};
                  const isWithdrawn = app.status === 'withdrawn';

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className={`py-4 px-4 sm:px-6 font-medium ${isWithdrawn ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {job.title || 'Role'}
                      </td>
                      <td className={`py-4 px-4 sm:px-6 ${isWithdrawn ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {job.companyName || 'Company'}
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        {renderStatusBadge(app.status)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right relative">
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === app.id ? null : app.id)
                            }
                            className="p-1.5 rounded-md text-ink-muted dark:text-zinc-400 hover:text-ink dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Action Popover Menu (Matching screenshot) */}
                          {activeMenuId === app.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-4 mt-1 w-32 rounded-lg bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-elevated py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-ink dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium transition-colors"
                              >
                                See More
                              </button>

                              {!isWithdrawn && (
                                <button
                                  type="button"
                                  onClick={() => handleWithdraw(app.id)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors"
                                >
                                  Withdraw
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Clean Empty State when user has not applied */
          <div className="py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6 text-ink-muted dark:text-zinc-400" />
            </div>
            <h3 className="text-base font-bold text-ink dark:text-white">
              No applications yet
            </h3>
            <p className="text-xs text-ink-muted dark:text-zinc-400 mt-1 max-w-sm mx-auto mb-5">
              You haven't applied to any jobs yet. Browse recent openings to apply and track your progress here.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Explore Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={selectedApp.job?.title || 'Application Details'}
          description={`${selectedApp.job?.companyName || ''} • ${selectedApp.job?.location || ''}`}
          footer={
            <div className="flex items-center justify-between w-full">
              {selectedApp.status !== 'withdrawn' ? (
                <button
                  type="button"
                  onClick={() => {
                    handleWithdraw(selectedApp.id);
                    setSelectedApp(null);
                  }}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline"
                >
                  Withdraw Application
                </button>
              ) : (
                <span className="text-xs text-zinc-400 italic">Withdrawn</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-border dark:border-zinc-700">
              <span className="font-semibold text-ink-muted dark:text-zinc-400">Application Status:</span>
              {renderStatusBadge(selectedApp.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 text-ink dark:text-zinc-100">
              <div className="p-3 rounded-lg border border-border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <span className="text-ink-muted dark:text-zinc-400 block text-[11px]">Applied On</span>
                <span className="font-semibold">
                  {new Date(selectedApp.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <span className="text-ink-muted dark:text-zinc-400 block text-[11px]">Batch Target</span>
                <span className="font-semibold">
                  {selectedApp.job?.batchYear || '2027'}
                </span>
              </div>
            </div>

            {selectedApp.job?.description && (
              <div>
                <h4 className="font-bold text-ink dark:text-white mb-1">Job Description:</h4>
                <p className="text-ink-muted dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                  {selectedApp.job.description}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
