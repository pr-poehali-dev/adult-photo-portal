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

export async function uploadVideoFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<SiteData> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getUploadUrl', fileName: file.name }),
  });
  if (!res.ok) throw new Error('presign failed');
  const { uploadUrl, cdnUrl, contentType } = await res.json();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`S3 ${xhr.status}`)));
    xhr.onerror = () => reject(new Error('network error'));
    xhr.send(file);
  });

  const confirm = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'confirmUpload', cdnUrl, fileName: file.name }),
  });
  if (!confirm.ok) throw new Error('confirm failed');
  return confirm.json();
}