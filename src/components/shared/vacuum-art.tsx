/** Animated illustration for the 404 and error pages: an upright vacuum gliding over a dusty floor. */
export function VacuumArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} role="img" aria-label="A vacuum cleaner gliding over a dusty floor">
      <defs>
        <linearGradient id="fd-body" x1="0" x2="1">
          <stop offset="0" stopColor="#0f766e" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>

      {/* floor */}
      <line x1="10" y1="214" x2="310" y2="214" stroke="currentColor" strokeOpacity=".18" strokeWidth="2" strokeLinecap="round" />

      {/* dust still waiting on the floor */}
      <g className="fd-dust" fill="#c9b79c">
        <circle cx="40" cy="208" r="4" style={{ animationDelay: "0s" }} />
        <circle cx="62" cy="210" r="2.5" style={{ animationDelay: ".4s" }} />
        <circle cx="84" cy="207" r="3.5" style={{ animationDelay: ".8s" }} />
        <circle cx="104" cy="209" r="2" style={{ animationDelay: "1.2s" }} />
        <circle cx="122" cy="206" r="3" style={{ animationDelay: "1.6s" }} />
      </g>

      {/* the vacuum */}
      <g className="fd-vac">
        {/* handle */}
        <line x1="214" y1="104" x2="246" y2="22" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
        <line x1="236" y1="18" x2="262" y2="28" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
        {/* body */}
        <rect x="186" y="96" width="46" height="94" rx="16" fill="url(#fd-body)" />
        <rect x="195" y="110" width="28" height="40" rx="9" fill="#ccfbf1" fillOpacity=".55" />
        <circle cx="209" cy="166" r="6" fill="#ffffff" fillOpacity=".85" />
        {/* floor head */}
        <rect x="140" y="182" width="124" height="26" rx="11" fill="#1e293b" />
        <rect x="140" y="200" width="124" height="6" rx="3" fill="#2dd4bf" fillOpacity=".55" />
        <circle cx="162" cy="210" r="8" fill="#0f172a" />
        <circle cx="244" cy="210" r="8" fill="#0f172a" />
        <circle cx="162" cy="210" r="3" fill="#5eead4" />
        <circle cx="244" cy="210" r="3" fill="#5eead4" />
      </g>

      {/* sparkle on the clean side */}
      <g className="fd-sparkle" fill="#2dd4bf">
        <path d="M290 150 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" />
        <path d="M276 112 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 l6 -2.5 z" style={{ animationDelay: ".6s" }} />
      </g>
    </svg>
  );
}
