import { getToken } from './auth';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = opts;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Could not reach the server. Please check your connection.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? 'Request failed');
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/pdf')) {
    return res.blob() as unknown as T;
  }

  return res.json();
}

export const authApi = {
  register: (email: string, password: string) =>
    request<{ accessToken: string }>('/auth/register', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),

  login: (email: string, password: string) =>
    request<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),
};

export type Profile = {
  id?: string;
  fullName?: string;
  phone?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  nationality?: string;
  targetType?: 'JOB' | 'AUSBILDUNG' | 'STUDIUM';
};

export const profileApi = {
  get: () => request<Profile | null>('/users/profile'),
  update: (data: Profile) => request<Profile>('/users/profile', { method: 'PUT', body: data }),
};

export type Application = {
  id: string;
  targetType: 'JOB' | 'AUSBILDUNG' | 'STUDIUM';
  titleOrRole: string;
  companyOrInstitution: string;
  targetDescription?: string;
  status: 'DRAFT' | 'GENERATED' | 'SENT';
  generatedCv?: string;
  generatedLetter?: string;
  createdAt: string;
};

async function downloadPdf(url: string, filename: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export const applicationsApi = {
  create: (data: Omit<Application, 'id' | 'status' | 'createdAt'>) =>
    request<Application>('/applications', { method: 'POST', body: data }),

  list: () => request<Application[]>('/applications'),

  get: (id: string) => request<Application>(`/applications/${id}`),

  generate: (id: string) =>
    request<Application>(`/applications/${id}/generate`, { method: 'POST' }),

  downloadCv: (id: string) =>
    downloadPdf(`${BASE}/applications/${id}/pdf/cv`, 'Lebenslauf.pdf'),

  downloadLetter: (id: string) =>
    downloadPdf(`${BASE}/applications/${id}/pdf/letter`, 'Motivationsschreiben.pdf'),
};