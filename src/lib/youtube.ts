/**
 * One declaration of the YouTube IFrame API for the whole site.
 *
 * Two components drive a player, the radio on the Mahalaya page and
 * the wireless on the music page. Declaring `window.YT` in both makes
 * TypeScript reject the second, so the shape and the loader live here.
 */

export type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  loadVideoById: (o: { videoId: string; startSeconds?: number }) => void;
  getPlayerState: () => number;
  destroy: () => void;
};

export type YTNamespace = {
  Player: new (el: HTMLElement | string, opts: unknown) => YTPlayer;
  PlayerState?: { ENDED: number; PLAYING: number; PAUSED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Loads the API once, whichever component asks first. Resolves even if
 * the callback never fires, so a blocked script degrades to a dead
 * button rather than a spinner that never stops.
 */
export function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    if (window.YT?.Player) return resolve();

    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }

    const prior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prior?.();
      resolve();
    };

    const started = Date.now();
    const poll = window.setInterval(() => {
      if (window.YT?.Player || Date.now() - started > 8000) {
        window.clearInterval(poll);
        resolve();
      }
    }, 120);
  });
}
