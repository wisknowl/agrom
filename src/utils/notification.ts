/**
 * AgroMarket Browser Desktop Notification Engine
 * Compatible with agrom.app (HTTPS) and localhost
 */

export type ChimeTone = 'harvest_bell' | 'marimba' | 'gentle_chime';

/**
 * Play a customizable pleasant chime using Web Audio API
 */
export function playNotificationChime(tone: ChimeTone = 'harvest_bell') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (tone === 'harvest_bell') {
      // Crisp two-tone bell (A5 to D6) - bright and distinct on laptops & PCs
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.46);
    } else if (tone === 'marimba') {
      // Warm organic wooden marimba chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.08); // E5

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Gentle sine sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(739.99, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(932.33, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    }
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
    soundTone?: ChimeTone;
  }
) {
  if (!options?.silent) {
    playNotificationChime(options?.soundTone || 'harvest_bell');
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

/**
 * Trigger an immediate test desktop notification and audio chime
 */
export async function testDesktopNotification(tone: ChimeTone = 'harvest_bell'): Promise<{
  success: boolean;
  message: string;
}> {
  playNotificationChime(tone);

  if (!isBrowserNotificationSupported()) {
    return {
      success: false,
      message: 'This web browser does not support desktop notifications.',
    };
  }

  let permission = Notification.permission;
  if (permission !== 'granted') {
    const granted = await requestBrowserNotificationPermission();
    if (!granted) {
      return {
        success: false,
        message:
          'Notification permission was blocked in your browser. Click the lock/settings icon in the address bar to allow notifications.',
      };
    }
    permission = 'granted';
  }

  try {
    const notif = new Notification('🌾 AgroMarket Test Notification', {
      body: 'Your computer notification system and audio chime are active!',
      icon: '/favicon.ico',
      tag: 'agromarket-test',
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return {
      success: true,
      message: 'Desktop notification dispatched! Check your screen corner or Windows Action Center.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Notification was blocked by system settings.',
    };
  }
}
