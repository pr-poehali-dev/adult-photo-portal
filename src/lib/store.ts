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
}

const STORAGE_KEY = 'site_data_v1';

export const defaultData: SiteData = {
  title: 'NEON GATE',
  description:
    'Эксклюзивный контент для взрослых. Оживляем фотографии и видео с помощью передовых технологий. Только проверенные материалы 18+.',
  videoUrl: '',
  videoName: '',
  ageWarning: 'Контент предназначен только для лиц старше 18 лет.',
  links: [
    { id: '1', title: 'Telegram канал', url: 'https://t.me', icon: 'Send' },
    { id: '2', title: 'Закрытый чат', url: 'https://t.me', icon: 'Lock' },
    { id: '3', title: 'Премиум доступ', url: '#', icon: 'Crown' },
  ],
};

export function loadData(): SiteData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveData(data: SiteData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
