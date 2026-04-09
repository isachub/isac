import { getToken } from './auth';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = opts;
  const url = `${BASE}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  console.log('Sending request to:', url);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    console.error('FETCH FAILED:', error);
    console.error('BASE =', BASE);
    console.error('PATH =', path);
    console.error('FULL URL =', url);
    throw new Error(`Could not reach the server: ${url}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('HTTP ERROR:', res.status, text);

    try {
      const parsed = text ? JSON.parse(text) : null;
      throw new Error(parsed?.message ?? `Request failed with status ${res.status}`);
    } catch {
      throw new Error(text || `Request failed with status ${res.status}`);
    }
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/pdf')) {
    return (await res.blob()) as unknown as T;
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
  update: (data: Profile) =>
    request<Profile>('/users/profile', {
      method: 'PUT',
      body: data,
    }),
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
  if (!token) {
    throw new Error('Not authenticated');
  }

  console.log('Downloading PDF from:', url);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('PDF FETCH FAILED:', error);
    console.error('PDF URL =', url);
    throw new Error(`Could not reach the server: ${url}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('PDF HTTP ERROR:', res.status, text);
    throw new Error(text || `Download failed with status ${res.status}`);
  }

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
    request<Application>('/applications', {
      method: 'POST',
      body: data,
    }),

  list: () => request<Application[]>('/applications'),

  get: (id: string) => request<Application>(`/applications/${id}`),

  generate: (id: string) =>
    request<Application>(`/applications/${id}/generate`, {
      method: 'POST',
    }),

  downloadCv: (id: string) =>
    downloadPdf(`${BASE}/applications/${id}/pdf/cv`, 'Lebenslauf.pdf'),

  downloadLetter: (id: string) =>
    downloadPdf(`${BASE}/applications/${id}/pdf/letter`, 'Motivationsschreiben.pdf'),
};