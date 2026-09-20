/**
 * Brand glyphs. lucide-react dropped its brand set in v1, so these
 * are drawn here as plain outline marks that sit correctly beside
 * the lucide icons used elsewhere.
 */

type Props = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export function InstagramIcon({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="2" y="5" width="20" height="14" rx="4.5" />
      <path d="M10.2 9.2 L15 12 L10.2 14.8 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsappIcon({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M21 11.6a8.9 8.9 0 0 1-13.2 7.8L3 21l1.7-4.6A8.9 8.9 0 1 1 21 11.6Z" />
      <path d="M8.9 8.4c.3-.1.6 0 .8.3l.8 1.3c.1.2.1.5-.1.7l-.5.5c-.1.2-.2.4-.1.6a5 5 0 0 0 2.3 2.3c.2.1.4 0 .6-.1l.5-.5c.2-.2.5-.2.7-.1l1.3.8c.3.2.4.5.3.8-.2.7-.9 1.2-1.7 1.2-2.9 0-5.7-2.8-5.7-5.7 0-.8.5-1.5 1.2-1.7Z" />
    </svg>
  );
}
