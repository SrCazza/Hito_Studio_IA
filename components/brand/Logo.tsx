/**
 * Marca "H*" de Hito IA Studio (derivada del logo madre Hito33).
 * `badge` = cuadrado verde con H* blanca (para nav/favicon).
 * Sin badge = H* en currentColor (para usos monocromos).
 */
export function Logo({
  size = 32,
  badge = true,
  className,
}: {
  size?: number;
  badge?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      role="img"
    >
      {badge && <rect width="100" height="100" rx="24" fill="#16794A" />}
      <g fill={badge ? "#ffffff" : "currentColor"}>
        <rect x="24" y="28" width="13" height="44" rx="1.5" />
        <rect x="55" y="28" width="13" height="44" rx="1.5" />
        <rect x="24" y="44" width="44" height="12" rx="1.5" />
        <g transform="translate(80 26)">
          <rect x="-12" y="-2.6" width="24" height="5.2" rx="2.6" />
          <rect x="-12" y="-2.6" width="24" height="5.2" rx="2.6" transform="rotate(45)" />
          <rect x="-12" y="-2.6" width="24" height="5.2" rx="2.6" transform="rotate(90)" />
          <rect x="-12" y="-2.6" width="24" height="5.2" rx="2.6" transform="rotate(135)" />
        </g>
      </g>
    </svg>
  );
}
