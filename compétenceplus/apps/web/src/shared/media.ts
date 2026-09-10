import { API_URL } from '@/shared/api-client';

/*
 * Uploaded videos are stored as `/media/videos/<name>`: the database keeps no
 * hostname. The front runs on another origin, so it prefixes them here.
 * External links (YouTube) are returned untouched.
 */
export function urlMedia(url: string): string {
  return url.startsWith('/') ? `${API_URL}${url}` : url;
}
