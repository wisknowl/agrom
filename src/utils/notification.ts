/**
 * AgroMarket Browser Desktop Notification Engine
 * Compatible with agrom.app (HTTPS) and localhost
 */

/**
 * Play a subtle, high-quality pleasant chime using Web Audio API
 */
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle two-tone chime (F#5 to A#5)
    osc.frequency.setValueAtTime(739.99, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(932.33, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch (err) {
    // Audio context may be restricted before first user interaction
  }
}

/**
 * Check if the browser supports desktop notifications
 */
export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Current notification permission state
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isBrowserNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!isBrowserNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

/**
 * Send a native computer/browser desktop notification
 */
export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    onClickUrl?: string;
    silent?: boolean;
  }
) {
  if (!options?.silent) {
    playNotificationChime();
  }

  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notif = new Notification(title, {
      body: options?.body || '',
      icon: options?.icon || '/favicon.ico',
      tag: options?.tag,
      badge: '/favicon.ico',
    });

    if (options?.onClickUrl) {
      notif.onclick = () => {
        window.focus();
        window.location.href = options.onClickUrl!;
        notif.close();
      };
    }
  } catch (err) {
    console.warn('Desktop notification dispatch failed:', err);
  }
}

