import { BUSINESS_INFO } from "@/config/business";

/**
 * First-visit intro (≈2s): an old-fashioned upright vacuum — cloth bag, chrome hood, headlight and trailing cord —
 * chugs across the floor and sucks the dust off the logo as it passes, then the screen lifts away.
 * Pure HTML + CSS + inline SVG, so it starts on the first paint.
 *
 * - Plays once per browser session (an inline script marks <html data-intro="seen"> before it can paint).
 * - Any click or key skips it. Visitors who prefer reduced motion never see it.
 * - Decorative: hidden from screen readers.
 */
const SCRIPT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem("fd-intro")){d.dataset.intro="seen";return}sessionStorage.setItem("fd-intro","1")}catch(e){}var t0=Date.now();function off(){removeEventListener("pointerdown",skip);removeEventListener("keydown",skip)}function skip(){off();if(!d.dataset.intro)d.dataset.intro=Date.now()-t0<1400?"skip":"seen"}addEventListener("pointerdown",skip);addEventListener("keydown",skip);setTimeout(function(){off();d.dataset.intro="seen"},2100)})();`;

/*
 * Timing. The vacuum's nozzle travels linearly from FROM% to TO% of the stage width, so it reaches x% at
 * DELAY + DRIVE * (x - FROM) / (TO - FROM). The clean logo, the clean floor and every speck use that formula,
 * which keeps them in step with the machine. The same numbers live in globals.css (.fd-intro-*).
 */
const DELAY = 0.1;
const DRIVE = 1.25;
const FROM = -30;
const TO = 115;
const reachesAt = (x: number) => DELAY + (DRIVE * (x - FROM)) / (TO - FROM);

// Dust on the logo (x, y in % of the logo row) and fluff on the floor (x in % of the stage).
const LOGO_DUST = [
  { x: 18, y: 30 }, { x: 24, y: 72 }, { x: 31, y: 20 }, { x: 37, y: 64 }, { x: 44, y: 38 },
  { x: 50, y: 80 }, { x: 56, y: 26 }, { x: 62, y: 60 }, { x: 69, y: 34 }, { x: 75, y: 74 }, { x: 81, y: 44 },
];
const FLOOR_DUST = [8, 21, 33, 47, 58, 71, 86, 95];

function Wordmark() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- must paint with the first HTML, before any JS */}
      <img className="fd-intro-mark" src="/brand/mascot.png" alt="" width={272} height={240} />
      <span className="fd-intro-name">{BUSINESS_INFO.brandName}</span>
    </>
  );
}

/** A 1950s-style upright: cloth bag on a raked handle, chrome motor hood, rubber bumper, headlight. Faces right. */
function OldVacuum() {
  return (
    <svg viewBox="0 0 220 200" className="fd-intro-vac-svg" overflow="visible">
      <defs>
        <linearGradient id="fdv-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset=".45" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="fdv-bag" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e7dcc3" />
          <stop offset=".5" stopColor="#f7f0de" />
          <stop offset="1" stopColor="#d9cbab" />
        </linearGradient>
        <linearGradient id="fdv-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fef3c7" stopOpacity=".55" />
          <stop offset="1" stopColor="#fef3c7" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* headlight beam on the floor ahead */}
      <path className="fd-intro-beam" d="M210 168 L300 150 L300 198 L210 182 Z" fill="url(#fdv-beam)" />

      {/* power cord trailing back off-screen */}
      <path
        d="M104 150 C 84 172, 70 197, 40 195 S -10 190, -120 196"
        fill="none"
        stroke="#64748b"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* handle + bag, raked back from the pivot */}
      <g transform="rotate(-24 140 165)">
        <rect x="137" y="8" width="7" height="160" rx="3.5" fill="url(#fdv-chrome)" />
        {/* grip */}
        <rect x="128" y="2" width="25" height="12" rx="6" fill="#1e293b" />
        <g className="fd-intro-bag">
          {/* puffy cloth bag, fuller at the bottom */}
          <path
            d="M128 36 Q118 37 116 58 L110 128 Q109 154 140.5 154 Q172 154 171 128 L165 58 Q163 37 153 36 Z"
            fill="url(#fdv-bag)"
            stroke="#bfae8a"
            strokeWidth="1.5"
          />
          {/* stitched seam, cloth creases and the brand band */}
          <path d="M140.5 42 V148" stroke="#bfae8a" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M122 112 Q128 118 124 128 M159 108 Q153 116 158 126" stroke="#cbbb95" strokeWidth="1.2" fill="none" />
          <path d="M114.6 76 H166.4 L167.4 90 H113.6 Z" fill="#0f766e" />
          <path d="M113.4 94 H167.6 L167.8 97 H113.2 Z" fill="#0f766e" />
          {/* zip collar at the top */}
          <rect x="125" y="28" width="31" height="9" rx="4.5" fill="#94a3b8" />
        </g>
      </g>

      {/* motor hood */}
      <path d="M116 190 L116 177 Q118 156 150 154 L184 154 Q208 156 212 177 L212 190 Z" fill="url(#fdv-chrome)" />
      <path d="M128 168 Q150 160 196 162" stroke="#ffffff" strokeOpacity=".8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="132" y="173" width="66" height="5" rx="2.5" fill="#0f766e" />
      {/* headlight */}
      <circle className="fd-intro-lamp" cx="206" cy="172" r="5.5" fill="#fef9c3" stroke="#94a3b8" strokeWidth="1.5" />
      {/* rubber bumper */}
      <rect x="112" y="186" width="104" height="7" rx="3.5" fill="#1e293b" />
      {/* wheels */}
      <g className="fd-intro-wheel">
        <circle cx="134" cy="192" r="7.5" fill="#0f172a" />
        <path d="M134 186 V198 M128 192 H140" stroke="#64748b" strokeWidth="1.6" />
      </g>
      <g className="fd-intro-wheel">
        <circle cx="194" cy="192" r="7.5" fill="#0f172a" />
        <path d="M194 186 V198 M188 192 H200" stroke="#64748b" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

export function Intro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div className="fd-intro" aria-hidden="true">
        <div className="fd-intro-stage">
          <div className="fd-intro-logo">
            {/* Dusty logo underneath… */}
            <div className="fd-intro-row fd-intro-dusty">
              <Wordmark />
            </div>
            {/* …and the clean one, revealed right behind the nozzle. */}
            <div className="fd-intro-row fd-intro-cleaned">
              <Wordmark />
            </div>
            {LOGO_DUST.map((s) => (
              <span
                key={s.x}
                className="fd-intro-speck"
                style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${(reachesAt(s.x) - 0.08).toFixed(2)}s` }}
              />
            ))}
          </div>

          <div className="fd-intro-floor">
            <span className="fd-intro-floor-clean" />
            {FLOOR_DUST.map((x) => (
              <span
                key={x}
                className="fd-intro-fluff"
                style={{ left: `${x}%`, animationDelay: `${(reachesAt(x) - 0.04).toFixed(2)}s` }}
              />
            ))}
            <span className="fd-intro-vac">
              <span className="fd-intro-chug">
                <OldVacuum />
              </span>
            </span>
          </div>

          <p className="fd-intro-tag">{BUSINESS_INFO.tagline}</p>
        </div>
      </div>
    </>
  );
}
