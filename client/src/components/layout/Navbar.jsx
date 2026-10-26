import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/Toast';
import { useTheme } from '../../context/ThemeContext';
import {
  ChevronDown,
  LogOut,
  FileText,
  KeyRound,
  PlusCircle,
  Menu,
  X,
  Briefcase,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Moon,
  Sun,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  const { showToast } = useToast();
  const { toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [employerDropdownOpen, setEmployerDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick employer login within dropdown
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState('');

  const profileDropdownRef = useRef(null);
  const employerDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setProfileDropdownOpen(false);
    setEmployerDropdownOpen(false);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        employerDropdownRef.current &&
        !employerDropdownRef.current.contains(event.target)
      ) {
        setEmployerDropdownOpen(false);
      }
    }
    if (profileDropdownOpen || employerDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen, employerDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleEmployerLogin = async (e) => {
    e.preventDefault();
    setEmpError('');
    setEmpLoading(true);
    try {
      const res = await login({ email: empEmail, password: empPassword });
      setEmployerDropdownOpen(false);
      setEmpEmail('');
      setEmpPassword('');
      showToast('Logged in to employer portal', 'success');
      if (res.user?.role === 'admin') {
        navigate('/admin/post-job');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setEmpError(err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setEmpLoading(false);
    }
  };

  // Avatar initials
  const getInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (!user) return 'Account';
    if (isAdmin) return 'Admin';
    const lastInitial = user.lastName ? ` ${user.lastName[0]}.` : '';
    return `${user.firstName}${lastInitial}`;
  };

  // Nav link style: darker and bolder font
  const navLinkClass = ({ isActive }) =>
    `text-sm transition-colors duration-150 py-1.5 px-3.5 rounded-md font-semibold ${
      isActive
        ? 'text-zinc-950 dark:text-white font-bold bg-zinc-100 dark:bg-zinc-800'
        : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c0d12]/90 backdrop-blur-md border-b border-border dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.jpg"
              alt="Scout Logo"
              className="w-8 h-8 rounded-lg object-cover border border-border dark:border-zinc-700 group-hover:opacity-90 transition-opacity"
            />
            <span className="font-bold tracking-tight text-lg text-ink dark:text-white">
              Scout
            </span>
          </Link>
        </div>

        {/* Center: Open Navigation Links: Jobs, Find Jobs, Dashboard, Info & Resume */}
        <nav className="hidden md:flex items-center justify-center gap-1.5 flex-1">
          <NavLink to="/jobs" className={navLinkClass}>
            Jobs
          </NavLink>
          <NavLink to="/find-jobs" className={navLinkClass}>
            Find Jobs
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/info-resume" className={navLinkClass}>
            Info & Resume
          </NavLink>
        </nav>

        {/* Right: Actions / Auth */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* For employers dropdown */}
          <div className="relative" ref={employerDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setEmployerDropdownOpen(!employerDropdownOpen);
                setProfileDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-200 hover:text-zinc-700 dark:hover:text-white px-2.5 py-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Employer login options"
            >
              <span>For employers</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-700 dark:text-zinc-400 transition-transform duration-200 ${
                  employerDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Employer Pop-up card */}
            {employerDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-[#161821] border border-border dark:border-zinc-800 shadow-elevated p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {isAdmin ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border dark:border-zinc-800">
                      <div className="text-xs font-bold text-ink dark:text-zinc-100">Employer Mode Active</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
                        Admin
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <Link
                        to="/admin/post-job"
                        onClick={() => setEmployerDropdownOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white hover:bg-zinc-800 transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Post a Campus Opening</span>
                      </Link>
                      <Link
                        to="/admin/postings"
                        onClick={() => setEmployerDropdownOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-ink dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-ink-muted" />
                        <span>Manage Job Postings</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 pb-2 border-b border-border dark:border-zinc-800">
                      <h4 className="text-xs font-bold text-ink dark:text-zinc-100">Employer Mode</h4>
                      <p className="text-[11px] text-ink-muted dark:text-zinc-400">Sign in to post jobs & view candidates</p>
                    </div>

                    {empError && (
                      <div className="mb-3 p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{empError}</span>
                      </div>
                    )}

                    <form onSubmit={handleEmployerLogin} className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-ink-muted dark:text-zinc-400 mb-1">
                          Employer Email
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            placeholder="admin@scout.app"
                            value={empEmail}
                            onChange={(e) => setEmpEmail(e.target.value)}
                            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 focus:border-zinc-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-ink-muted dark:text-zinc-400 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={empPassword}
                            onChange={(e) => setEmpPassword(e.target.value)}
                            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-ink dark:text-zinc-100 focus:border-zinc-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={empLoading}
                        className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-blue-600 text-white text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-blue-700 disabled:opacity-60 transition-colors"
                      >
                        {empLoading ? 'Signing in...' : 'Enter Employer Mode'}
                        {!empLoading && <ArrowRight className="w-3.5 h-3.5" />}
                      </button>
                    </form>

                    <div className="mt-3 pt-2 border-t border-border dark:border-zinc-800 flex items-center justify-end text-[11px]">
                      <Link
                        to="/admin/post-job"
                        onClick={() => setEmployerDropdownOpen(false)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Post opening &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isAuthenticated ? (
            <>
              {/* Log in */}
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-ink dark:text-zinc-200 hover:text-ink-muted dark:hover:text-white px-3 py-1.5 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Log in
              </Link>

              {/* Sign up with Ariakit Blue */}
              <Link
                to="/signup"
                className="text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Admin quick action */}
              {isAdmin && (
                <Link
                  to="/admin/post-job"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Post a Job
                </Link>
              )}

              {/* User Account Menu */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-border dark:border-zinc-700 transition-colors text-xs font-semibold text-ink dark:text-zinc-100 shadow-xs"
                  aria-label="User account menu"
                >
                  <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {getInitials()}
                  </div>
                  <span>{getDisplayName()}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted dark:text-zinc-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#161821] border border-border dark:border-zinc-800 shadow-elevated py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-border dark:border-zinc-800">
                      <p className="text-xs font-semibold text-ink dark:text-zinc-100 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-ink-muted dark:text-zinc-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {!isAdmin ? (
                      <>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-ink dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-ink-muted dark:text-zinc-400" />
                          My Applications
                        </Link>
                        <Link
                          to="/info-resume"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-ink dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors"
                        >
                          <FileText className="w-4 h-4 text-ink-muted dark:text-zinc-400" />
                          My Info & Resume
                        </Link>
                        <Link
                          to="/info-resume?tab=security"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-ink dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors"
                        >
                          <KeyRound className="w-4 h-4 text-ink-muted dark:text-zinc-400" />
                          Change Password
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/admin/post-job"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-ink dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-ink dark:text-white" />
                          Post a Job
                        </Link>
                        <Link
                          to="/admin/postings"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-ink dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-ink-muted dark:text-zinc-400" />
                          My Postings
                        </Link>
                      </>
                    )}

                    <div className="border-t border-border dark:border-zinc-800 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-danger hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dark Mode Toggle - positioned to the right of Signup / Account */}
          <div className="relative group/theme">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle theme"
            >
              <Moon className="w-5 h-5 dark:hidden text-zinc-700 hover:text-zinc-950 transition-colors" />
              <Sun className="hidden dark:block w-5 h-5 text-amber-400 hover:text-amber-300 transition-colors" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover/theme:block whitespace-nowrap text-[11px] font-medium py-1 px-2.5 rounded-md bg-zinc-900 text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900 pointer-events-none z-50">
              <span className="dark:hidden">Switch to dark mode</span>
              <span className="hidden dark:inline">Switch to light mode</span>
            </div>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
              {getInitials()}
            </div>
          )}
          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 border border-border dark:border-zinc-700 flex items-center justify-center cursor-pointer"
            aria-label="Toggle theme"
          >
            <Moon className="w-4 h-4 dark:hidden text-zinc-700" />
            <Sun className="hidden dark:block w-4 h-4 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 border border-border dark:border-zinc-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border dark:border-zinc-800 bg-white dark:bg-[#0c0d12] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <NavLink to="/jobs" className={navLinkClass}>
              Jobs
            </NavLink>
            <NavLink to="/find-jobs" className={navLinkClass}>
              Find Jobs
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/info-resume" className={navLinkClass}>
              Info & Resume
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/post-job" className={navLinkClass}>
                Post a Job
              </NavLink>
            )}
          </div>

          <div className="border-t border-border dark:border-zinc-800 pt-3">
            {!isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/login?role=employer"
                  className="block w-full text-center px-4 py-2 text-xs font-medium text-ink dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-lg"
                >
                  For employers
                </Link>
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-2 text-xs font-medium text-ink dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-ink-muted px-2">
                  Signed in as{' '}
                  <span className="font-semibold text-ink">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-xs font-semibold text-danger border border-rose-200 rounded-lg hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
