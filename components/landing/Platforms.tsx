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

export const Facebook = ({ className, size = 24 }: P) => (
  <svg {...wrap(size)} className={className} fill="currentColor">
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
  </svg>
);
