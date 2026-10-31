export const getBackendOrigin = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5000';
};

export const getBaseApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return String(import.meta.env.VITE_API_URL);
  }
  return 'http://localhost:5000/api';
};

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    // Rewrite Android emulator loopback 10.0.2.2 to localhost for web browsers
    return trimmed.replace('http://10.0.2.2:5000', getBackendOrigin());
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

