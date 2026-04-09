'use client';

import { useEffect, useState } from 'react';
import { profileApi, type Profile } from '@/lib/api';

const TARGET_TYPES = [
  { value: 'JOB', label: 'Job' },
  { value: 'AUSBILDUNG', label: 'Ausbildung' },
  { value: 'STUDIUM', label: 'Studium' },
];

const EMPTY: Profile = {
  fullName: '',
  phone: '',
  city: '',
  country: '',
  dateOfBirth: '',
  nationality: '',
  targetType: undefined,
};

const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white';
const label = 'block text-sm font-medium text-gray-700 mb-1';

export default function ProfilePage() {
  const [form, setForm] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    profileApi
      .get()
      .then((data) => {
        if (data) {
          setForm({
            ...data,
            dateOfBirth: data.dateOfBirth
              ? (new Date(data.dateOfBirth).toISOString().split('T')[0] ?? '')
              : '',
          });
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await profileApi.update(form);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading profile…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
      <p className="text-sm text-gray-500 mb-8">
        This information is used to generate your documents.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

        <div>
          <label className={label}>Full name</label>
          <input name="fullName" type="text" className={input} value={form.fullName ?? ''} onChange={handleChange} placeholder="Youssef El Amrani" />
        </div>

        <div>
          <label className={label}>Phone</label>
          <input name="phone" type="tel" className={input} value={form.phone ?? ''} onChange={handleChange} placeholder="+49 151 00000000" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>City</label>
            <input name="city" type="text" className={input} value={form.city ?? ''} onChange={handleChange} placeholder="Munich" />
          </div>
          <div>
            <label className={label}>Country</label>
            <input name="country" type="text" className={input} value={form.country ?? ''} onChange={handleChange} placeholder="Deutschland" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Date of birth</label>
            <input name="dateOfBirth" type="date" className={input} value={form.dateOfBirth ?? ''} onChange={handleChange} />
          </div>
          <div>
            <label className={label}>Nationality</label>
            <input name="nationality" type="text" className={input} value={form.nationality ?? ''} onChange={handleChange} placeholder="Moroccan" />
          </div>
        </div>

        <div>
          <label className={label}>I am applying for</label>
          <select name="targetType" className={input} value={form.targetType ?? ''} onChange={handleChange}>
            <option value="">Select a target</option>
            {TARGET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">Profile saved successfully.</p>
        )}

        <button type="submit" disabled={saving} className="w-full py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
