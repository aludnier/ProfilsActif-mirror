/*
 * The service only accepts YouTube links, so a video is identified by its
 * 11-character id rather than by the URL the candidate pasted: the same video
 * can arrive as watch?v=, youtu.be/, /shorts/ or /embed/, with tracking
 * parameters attached. Storing one canonical form avoids five rows for one
 * video.
 */
const MOTIFS = [
  /[?&]v=([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/,
];

/** Returns the video id, or null when the link is not a usable YouTube one. */
export function extraireIdYouTube(lien: string): string | null {
  const propre = lien.trim();

  if (/^[A-Za-z0-9_-]{11}$/.test(propre)) {
    return propre;
  }

  for (const motif of MOTIFS) {
    const trouve = propre.match(motif);
    if (trouve !== null) {
      return trouve[1];
    }
  }

  return null;
}

/*
 * youtube-nocookie + insertion only on click: a YouTube iframe loads Google
 * scripts and cookies as soon as it exists, which we don't want to do before
 * the visitor has asked for the video.
 */
export function urlIntegrationYouTube(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`;
}

export function urlPubliqueYouTube(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

// Thumbnail served by YouTube's image CDN: no cookie, unlike the iframe.
export function urlVignetteYouTube(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
