import funcUrls from '../../backend/func2url.json';

const API = (funcUrls as Record<string, string>).content;

export interface SiteLink {
  id: string;
  title: string;
  url: string;
  icon: string;
}

export interface SiteData {
  title: string;
  description: string;
  videoUrl: string;
  videoName: string;
  links: SiteLink[];
  ageWarning: string;
  showAgeGate: boolean;
}

export const defaultData: SiteData = {
  title: 'NEON GATE',
  description: '',
  videoUrl: '',
  videoName: '',
  ageWarning: 'Контент предназначен только для лиц старше 18 лет.',
  showAgeGate: true,
  links: [],
};

export async function fetchData(): Promise<SiteData> {
  const res = await fetch(API);
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
}

async function post(payload: Record<string, unknown>): Promise<SiteData> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('request failed');
  return res.json();
}

export const saveSettings = (d: Pick<SiteData, 'title' | 'description' | 'ageWarning' | 'showAgeGate'>) =>
  post({ action: 'saveSettings', ...d });

export const saveLinks = (links: SiteLink[]) => post({ action: 'saveLinks', links });

export const deleteVideo = () => post({ action: 'deleteVideo' });

export const uploadVideo = (fileBase64: string, fileName: string) =>
  post({ action: 'uploadVideo', fileBase64, fileName });
