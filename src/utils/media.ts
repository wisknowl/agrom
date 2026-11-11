export const getBackendOrigin = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return String(import.meta.env.VITE_API_URL).replace(/\/+$/, '').replace(/\/api$/, '');
  }
  // Use relative origin so Vite's /api and /uploads proxy works seamlessly on both
  // desktop (localhost:3000) and mobile devices on the same Wi-Fi/LAN (192.168.x.x:3000)
  return '';
};

export const getBaseApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    const clean = String(import.meta.env.VITE_API_URL).replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return '/api';
};

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    // Rewrite hardcoded localhost or Android emulator 10.0.2.2 backend URLs
    // so mobile web browsers over LAN load /uploads/* through the Vite proxy
    return trimmed
      .replace(/^http:\/\/10\.0\.2\.2:5000/i, getBackendOrigin())
      .replace(/^http:\/\/localhost:5000/i, getBackendOrigin())
      .replace(/^http:\/\/127\.0\.0\.1:5000/i, getBackendOrigin());
  }
  if (trimmed.startsWith('/assets/')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${getBackendOrigin()}${cleanPath}`;
};

export const isVideoMedia = (url?: string | null, explicitFlag?: boolean): boolean => {
  if (explicitFlag) return true;
  if (!url) return false;
  const lower = url.toLowerCase().split('?')[0];
  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.m4v')
  );
};

export const formatXaf = (amount: number | string | undefined, currency: string = 'FCFA'): string => {
  const num = Number(amount) || 0;
  if (currency === 'USD') {
    const usd = num > 1000 ? (num / 600).toFixed(2) : num.toFixed(2);
    return `$${Number(usd).toLocaleString()}`;
  }
  return `${Math.round(num).toLocaleString()} ${currency}`;
};
