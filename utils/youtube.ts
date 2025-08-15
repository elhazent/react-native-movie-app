// src/utils/youtube.ts
import 'react-native-url-polyfill/auto';

/**
 * Ekstrak videoId YouTube dari berbagai format URL atau langsung dari ID.
 * Contoh yang didukung:
 * - https://www.youtube.com/watch?v=abcdef
 * - https://youtu.be/abcdef?t=30
 * - https://www.youtube.com/embed/abcdef
 * - https://www.youtube.com/shorts/abcdef
 * - abcdef (langsung ID)
 */
export const extractYouTubeId = (input?: string | null): string | null => {
  if (!input) return null;

  const raw = input.trim();

  // Jika user langsung kasih ID (tanpa URL), terima
  if (/^[\w-]{10,}$/.test(raw) && !raw.includes('/')) return raw;

  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      // https://youtu.be/<id>?t=30
      return u.pathname.slice(1) || null;
    }

    if (host.endsWith('youtube.com')) {
      // https://youtube.com/watch?v=<id>
      if (u.pathname === '/watch') return u.searchParams.get('v');

      // https://youtube.com/embed/<id>
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null;

      // https://youtube.com/shorts/<id>
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null;
    }
  } catch {
    // bukan URL valid → coba fallback cek pola ID
    if (/^[\w-]{10,}$/.test(raw)) return raw;
  }

  return null;
};

/** Bangun URL watch dari videoId */
export const toYouTubeWatchUrl = (videoId?: string | null) =>
  videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
