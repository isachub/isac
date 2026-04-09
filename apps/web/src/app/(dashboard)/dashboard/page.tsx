'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { applicationsApi, type Application } from '@/lib/api';

const STATUS_LABEL: Record<Application['status'], string> = {
  DRAFT: 'Draft',
  GENERATED: 'Generated',
  SENT: 'Sent',
};

const STATUS_COLOR: Record<Application['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  GENERATED: 'bg-green-100 text-green-700',
  SENT: 'bg-blue-100 text-blue-700',
};

const TARGET_LABEL: Record<string, string> = {
  JOB: 'Job',
  AUSBILDUNG: 'Ausbildung',
  STUDIUM: 'Studium',
};

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    applicationsApi
      .list()
      .then(setApplications)
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Each application generates a CV and motivation letter.
          </p>
        </div>
        <Link
          href="/applications/new"
          className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          New application
        </Link>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-500 text-sm">No applications yet.</p>
          <Link
            href="/applications/new"
            className="mt-4 inline-block px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            Create your first application
          </Link>
        </div>
      )}

      {!loading && applications.length > 0 && (
        <ul className="space-y-3">
          {applications.map((app) => (
            <li key={app.id}>
              <Link
                href={`/applications/${app.id}`}
                className="block bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-brand transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{app.titleOrRole}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{app.companyOrInstitution}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">
                      {TARGET_LABEL[app.targetType]}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[app.status]}`}>
                      {STATUS_LABEL[app.status]}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
