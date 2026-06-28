/** Glifos monocromos de plataformas (currentColor). Simples y reconocibles. */
type P = { className?: string; size?: number };

const wrap = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true });

export const Instagram = ({ className, size = 24 }: P) => (
  <svg {...wrap(size)} className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const LinkedIn = ({ className, size = 24 }: P) => (
  <svg {...wrap(size)} className={className} fill="currentColor">
    <path d="M20.4 3H3.6A.6.6 0 0 0 3 3.6v16.8a.6.6 0 0 0 .6.6h16.8a.6.6 0 0 0 .6-.6V3.6a.6.6 0 0 0-.6-.6ZM8.3 18.3H5.5V9.7h2.8v8.6ZM6.9 8.5a1.6 1.6 0 1 1 0-3.3 1.6 1.6 0 0 1 0 3.3Zm11.4 9.8h-2.8v-4.2c0-1-.4-1.7-1.3-1.7-.7 0-1.1.5-1.3 1-.1.2-.1.4-.1.7v4.2H10V9.7h2.7v1.2c.4-.6 1-1.4 2.6-1.4 1.9 0 3 1.2 3 3.8v5Z" />
  </svg>
);

export const XCom = ({ className, size = 24 }: P) => (
  <svg {...wrap(size)} className={className} fill="currentColor">
    <path d="M17.7 3h3.3l-7.2 8.3L22 21h-6.6l-5.2-6.8L4.3 21H1l7.7-8.9L2 3h6.8l4.7 6.2L17.7 3Zm-1.2 16h1.8L7.6 4.9H5.7L16.5 19Z" />
  </svg>
);

export const TikTok = ({ className, size = 24 }: P) => (
  <svg {...wrap(size)} className={className} fill="currentColor">
    <path d="M16.5 3c.3 1.9 1.4 3.4 3.5 3.6v2.5c-1.2.1-2.4-.3-3.5-1v5.9a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.8V3h2.6Z" />
  </svg>
);

export const YouTube = ({ className, size = 24 }: P) => (
  <svg {...wrap(size)} className={className} fill="currentColor">
    <path d="M23 12s0-3.1-.4-4.6a2.4 2.4 0 0 0-1.7-1.7C19.4 5.3 12 5.3 12 5.3s-7.4 0-8.9.4A2.4 2.4 0 0 0 1.4 7.4C1 8.9 1 12 1 12s0 3.1.4 4.6a2.4 2.4 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.4 2.4 0 0 0 1.7-1.7C23 15.1 23 12 23 12ZM9.8 15.2V8.8l5.5 3.2-5.5 3.2Z" />
  </svg>
);

export const Facebook = ({ className, size = 24 }: P) => (
  <svg {...wrap(size)} className={className} fill="currentColor">
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
  </svg>
);

export const ALL_PLATFORMS = [
  { name: "Instagram", Icon: Instagram },
  { name: "LinkedIn", Icon: LinkedIn },
  { name: "X", Icon: XCom },
  { name: "TikTok", Icon: TikTok },
  { name: "YouTube", Icon: YouTube },
  { name: "Facebook", Icon: Facebook },
] as const;
