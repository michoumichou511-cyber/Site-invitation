/** Écran Karakou en SVG intégré : affiché tout de suite, sans requête réseau. */
export function KarakouScreen({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 270 570" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="kk-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4D1919" />
          <stop offset="1" stopColor="#381111" />
        </linearGradient>
      </defs>
      <rect width="270" height="570" fill="url(#kk-bg)" />
      <path
        d="M35 510V180a100 100 0 0 1 200 0v330"
        fill="none"
        stroke="#B49068"
        strokeWidth="1.5"
      />
      <path d="M45 500V185a90 90 0 0 1 180 0v315" fill="none" stroke="#B49068" strokeWidth=".6" />
      <g transform="translate(135 125)" fill="none" stroke="#B49068">
        <rect x="-17" y="-17" width="34" height="34" />
        <rect x="-17" y="-17" width="34" height="34" transform="rotate(45)" />
      </g>
      <g textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fill="#F6EDE3">
        <text x="135" y="260" fontSize="44">
          Amine
        </text>
        <text x="135" y="295" fontSize="22" fill="#B49068">
          &amp;
        </text>
        <text x="135" y="340" fontSize="44">
          Sara
        </text>
      </g>
      <text
        x="135"
        y="385"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize="13"
        fill="#E3D3C2"
      >
        Salle El Djazira · 19h00
      </text>
      <rect x="75" y="440" width="120" height="32" rx="16" fill="#B49068" />
      <text
        x="135"
        y="461"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="#381111"
      >
        ♥
      </text>
    </svg>
  );
}
