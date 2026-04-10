'use client';

import { useEffect, useState } from 'react';
import { profileApi, type Profile } from '@/lib/api';

const TARGET_TYPES = [
  { value: 'JOB', label: 'Job' },
  { value: 'AUSBILDUNG', label: 'Ausbildung' },
  { value: 'STUDIUM', label: 'Studium' },
];

const EMPTY: Profile = {
  fullName: '', phone: '', street: '', postalCode: '', city: '', country: '',
  dateOfBirth: '', nationality: '', summary: '', workExperience: '',
  education: '', skills: '', languages: '', certificates: '', targetType: undefined,
};

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white';
const area = `${inp} resize-none`;
const lbl = 'block text-sm font-medium text-gray-700 mb-1';
const hint = 'text-xs text-gray-400 mt-1';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-4 pb-1 border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{children}</h2>
    </div>
  );
}

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
            ...EMPTY,
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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
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

  if (loading) return <p className="text-sm text-gray-500">Loading profile…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
      <p className="text-sm text-gray-500 mb-8">
        This information is used to generate your German CV and motivation letter.
        The more you fill in, the better the result.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

        <SectionTitle>Personal information</SectionTitle>

        <div>
          <label className={lbl}>Full name</label>
          <input name="fullName" type="text" className={inp} value={form.fullName ?? ''} onChange={handleChange} placeholder="Youssef El Amrani" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Phone</label>
            <input name="phone" type="tel" className={inp} value={form.phone ?? ''} onChange={handleChange} placeholder="+49 151 00000000" />
          </div>
          <div>
            <label className={lbl}>Date of birth</label>
            <input name="dateOfBirth" type="date" className={inp} value={form.dateOfBirth ?? ''} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Nationality</label>
            <input name="nationality" type="text" className={inp} value={form.nationality ?? ''} onChange={handleChange} placeholder="Moroccan" />
          </div>
          <div>
            <label className={lbl}>I am applying for</label>
            <select name="targetType" className={inp} value={form.targetType ?? ''} onChange={handleChange}>
              <option value="">Select a target</option>
              {TARGET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <SectionTitle>Address</SectionTitle>

        <div>
          <label className={lbl}>Street and number</label>
          <input name="street" type="text" className={inp} value={form.street ?? ''} onChange={handleChange} placeholder="Musterstraße 12" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Postal code</label>
            <input name="postalCode" type="text" className={inp} value={form.postalCode ?? ''} onChange={handleChange} placeholder="80331" />
          </div>
          <div>
            <label className={lbl}>City</label>
            <input name="city" type="text" className={inp} value={form.city ?? ''} onChange={handleChange} placeholder="Munich" />
          </div>
        </div>

        <div>
          <label className={lbl}>Country</label>
          <input name="country" type="text" className={inp} value={form.country ?? ''} onChange={handleChange} placeholder="Deutschland" />
        </div>

        <SectionTitle>Professional summary</SectionTitle>

        <div>
          <label className={lbl}>About you <span className="text-gray-400 font-normal">(2–4 sentences)</span></label>
          <textarea name="summary" className={area} rows={3} value={form.summary ?? ''} onChange={handleChange}
            placeholder="Motivated cook with 3 years of experience in German restaurants. Strong work ethic, fast learner, and team-oriented. Looking to grow in a professional kitchen environment." />
          <p className={hint}>Used in your motivation letter opening and CV summary section.</p>
        </div>

        <SectionTitle>Work experience</SectionTitle>

        <div>
          <label className={lbl}>Work history <span className="text-gray-400 font-normal">(one entry per line)</span></label>
          <textarea name="workExperience" className={area} rows={5} value={form.workExperience ?? ''} onChange={handleChange}
            placeholder={`2022–2024 | Koch | Restaurant Sonnenhof, Munich\n- Prepared daily à la carte menus for up to 80 guests\n- Trained 2 junior kitchen staff\n\n2020–2022 | Kitchen Helper | Hotel Alpen, Innsbruck`} />
          <p className={hint}>Include dates, job title, employer, and key responsibilities.</p>
        </div>

        <SectionTitle>Education</SectionTitle>

        <div>
          <label className={lbl}>Education history <span className="text-gray-400 font-normal">(one entry per line)</span></label>
          <textarea name="education" className={area} rows={4} value={form.education ?? ''} onChange={handleChange}
            placeholder={`2018–2020 | Ausbildung Koch | Berufsschule München\n\n2015–2018 | High School Diploma | Lycée Ibn Sina, Casablanca`} />
        </div>

        <SectionTitle>Skills &amp; languages</SectionTitle>

        <div>
          <label className={lbl}>Skills</label>
          <input name="skills" type="text" className={inp} value={form.skills ?? ''} onChange={handleChange}
            placeholder="HACCP, Kassensystem, MS Office, Teamarbeit, Kundenorientierung" />
          <p className={hint}>Comma-separated list of technical and professional skills.</p>
        </div>

        <div>
          <label className={lbl}>Languages</label>
          <input name="languages" type="text" className={inp} value={form.languages ?? ''} onChange={handleChange}
            placeholder="Arabisch (Muttersprache), Deutsch (B2), Englisch (B1)" />
        </div>

        <div>
          <label className={lbl}>Certificates <span className="text-gray-400 font-normal">(optional)</span></label>
          <input name="certificates" type="text" className={inp} value={form.certificates ?? ''} onChange={handleChange}
            placeholder="Hygieneschulung §43 IfSG (2023), Erste-Hilfe-Kurs (2022)" />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">Profile saved successfully.</p>
        )}

        <button type="submit" disabled={saving}
          className="w-full py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
