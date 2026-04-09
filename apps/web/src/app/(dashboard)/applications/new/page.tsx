'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { applicationsApi } from '@/lib/api';

const TARGET_TYPES = [
  { value: 'JOB', label: 'Job' },
  { value: 'AUSBILDUNG', label: 'Ausbildung' },
  { value: 'STUDIUM', label: 'Studium' },
];

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white';
const lbl = 'block text-sm font-medium text-gray-700 mb-1';

export default function NewApplicationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    targetType: '' as 'JOB' | 'AUSBILDUNG' | 'STUDIUM' | '',
    titleOrRole: '',
    companyOrInstitution: '',
    targetDescription: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.targetType) return setError('Please select a target type');
    setError('');
    setLoading(true);
    try {
      const app = await applicationsApi.create({
        targetType: form.targetType,
        titleOrRole: form.titleOrRole,
        companyOrInstitution: form.companyOrInstitution,
        targetDescription: form.targetDescription || undefined,
      });
      router.push(`/applications/${app.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to applications
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">New application</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fill in the target details. The AI will use this to generate your documents.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

        <div>
          <label className={lbl}>I am applying for</label>
          <select name="targetType" className={inp} value={form.targetType} onChange={handleChange} required>
            <option value="">Select a type</option>
            {TARGET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={lbl}>Position / Role / Programme</label>
          <input
            name="titleOrRole"
            type="text"
            className={inp}
            value={form.titleOrRole}
            onChange={handleChange}
            required
            placeholder="e.g. Koch, Software Developer, Informatik B.Sc."
          />
        </div>

        <div>
          <label className={lbl}>Company / Institution</label>
          <input
            name="companyOrInstitution"
            type="text"
            className={inp}
            value={form.companyOrInstitution}
            onChange={handleChange}
            required
            placeholder="e.g. Restaurant Sonnenhof, TU München"
          />
        </div>

        <div>
          <label className={lbl}>
            Job / programme description
            <span className="text-gray-400 font-normal ml-1">(optional but recommended)</span>
          </label>
          <textarea
            name="targetDescription"
            className={`${inp} resize-none`}
            rows={5}
            value={form.targetDescription}
            onChange={handleChange}
            placeholder="Paste the job ad, requirements, or any details about the company or programme…"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create application'}
        </button>
      </form>
    </div>
  );
}
