import React from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import Button from '../components/ui/Button';
import { Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <PageShell className="py-20">
      <div className="max-w-md mx-auto text-center bg-white border border-border rounded-lg p-10 shadow-card space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-border text-accent flex items-center justify-center mx-auto text-xl font-extrabold">
          404
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Page not found</h1>
        <p className="text-xs text-ink-muted leading-relaxed">
          The page you are looking for does not exist or has been moved to a new route.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="sm" icon={Home}>
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="secondary" size="sm" icon={Compass}>
              Browse Jobs
            </Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
