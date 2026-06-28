/** Iconos de línea (stroke 1.75), consistentes — nada de emoji. */
type P = { className?: string };
const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconVolume = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="4" width="14" height="14" rx="2" />
    <path d="M7 8h6M7 12h6M7 16h3" />
    <path d="M21 8v12a1 1 0 0 1-1 1H8" />
  </svg>
);

export const IconData = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 19V5M9 19v-6M14 19V9M19 19v-9" />
    <path d="M3 19h18" />
  </svg>
);

export const IconBrand = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4 7.2 18.7l.9-5.4L4.2 9.5l5.4-.8L12 3Z" />
  </svg>
);

export const IconPackage = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

export const IconCheck = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m20 6-11 11-5-5" />
  </svg>
);

export const IconShield = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconArrow = ({ className }: P) => (
  <svg {...base} className={className} width={18} height={18}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconHeart = ({ className }: P) => (
  <svg {...base} className={className} width={18} height={18}>
    <path d="M19 14c1.5-1.5 2-3.5 2-5a4 4 0 0 0-7-2.7A4 4 0 0 0 7 6c0 1.5.5 3.5 2 5l5 5 5-5Z" />
  </svg>
);

export const IconComment = ({ className }: P) => (
  <svg {...base} className={className} width={18} height={18}>
    <path d="M21 11.5a8 8 0 0 1-11.5 7.2L3 21l2.3-6.5A8 8 0 1 1 21 11.5Z" />
  </svg>
);

export const IconBookmark = ({ className }: P) => (
  <svg {...base} className={className} width={18} height={18}>
    <path d="M6 3h12v18l-6-4-6 4V3Z" />
  </svg>
);

export const IconShare = ({ className }: P) => (
  <svg {...base} className={className} width={18} height={18}>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
  </svg>
);
