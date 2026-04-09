'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { applicationsApi, type Application } from '@/lib/api';

const TARGET_LABEL: Record<string, string> = {
  JOB: 'Job',
  AUSBILDUNG: 'Ausbildung',
  STUDIUM: 'Studium',
};

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    applicationsApi
      .get(id)
      .then(setApp)
      .catch(() => setError('Failed to load application'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerate() {
    setError('');
    setGenerating(true);
    try {
      const updated = await applicationsApi.generate(id);
      setApp(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!app) return <p className="text-sm text-red-600">{error || 'Application not found.'}</p>;

  const isGenerated = app.status === 'GENERATED' || app.status === 'SENT';

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to applications
        </Link>
        <div className="flex items-start justify-between mt-3 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{app.titleOrRole}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{app.companyOrInstitution}</p>
          </div>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
            isGenerated ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {isGenerated ? 'Generated' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Application details */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
        <Row label="Type" value={TARGET_LABEL[app.targetType]} />
        <Row label="Position" value={app.titleOrRole} />
        <Row label="Company / Institution" value={app.companyOrInstitution} />
        {app.targetDescription && (
          <div>
            <p className="text-gray-500 mb-1">Description</p>
            <p className="text-gray-900 whitespace-pre-wrap">{app.targetDescription}</p>
          </div>
        )}
      </div>

      {/* Generate section */}
      {!isGenerated && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Generate documents</h2>
          <p className="text-sm text-gray-500 mb-4">
            The AI will generate a German CV and motivation letter based on your profile and this application.
            Make sure your profile is complete before generating.
          </p>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {generating ? 'Generating… this may take a moment' : 'Generate CV + Letter'}
          </button>
        </div>
      )}

      {/* Generated documents */}
      {isGenerated && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Generated documents</h2>

          <DocumentCard
            title="Lebenslauf (CV)"
            content={app.generatedCv}
            onDownload={() => applicationsApi.downloadCv(id)}
            downloadLabel="Download CV PDF"
          />

          <DocumentCard
            title="Motivationsschreiben"
            content={app.generatedLetter}
            onDownload={() => applicationsApi.downloadLetter(id)}
            downloadLabel="Download Letter PDF"
          />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

function DocumentCard({
  title,
  content,
  onDownload,
  downloadLabel,
}: {
  title: string;
  content?: string | null;
  onDownload: () => Promise<void>;
  downloadLabel: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');

  async function handleDownload() {
    setDlError('');
    setDownloading(true);
    try {
      await onDownload();
    } catch {
      setDlError('Download failed');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-1.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {downloading ? 'Downloading…' : downloadLabel}
        </button>
      </div>
      {dlError && <p className="text-sm text-red-600 mb-3">{dlError}</p>}
      {content && (
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
          {content}
        </pre>
      )}
    </div>
  );
}
