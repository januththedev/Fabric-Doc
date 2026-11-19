import { Sparkles } from "lucide-react";
import { BUSINESS_INFO } from "@/config/business";

/**
 * First-visit intro (≈1.8s): a glowing vacuum line sweeps across a dusty logo, leaving it crisp,
 * then the screen lifts away. Pure HTML + CSS, so it starts on the first paint.
 *
 * - Plays once per browser session (an inline script marks <html data-intro="seen"> before it can paint).
 * - Any click or key skips it. Visitors who prefer reduced motion never see it.
 * - Decorative: hidden from screen readers.
 */
const SCRIPT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem("fd-intro")){d.dataset.intro="seen";return}sessionStorage.setItem("fd-intro","1")}catch(e){}var t0=Date.now();function off(){removeEventListener("pointerdown",skip);removeEventListener("keydown",skip)}function skip(){off();if(!d.dataset.intro)d.dataset.intro=Date.now()-t0<1300?"skip":"seen"}addEventListener("pointerdown",skip);addEventListener("keydown",skip);setTimeout(function(){off();d.dataset.intro="seen"},2100)})();`;

// Dust on the logo, picked up as the line passes. x = horizontal position (%); its delay follows from x.
const SPECKS = [
  { x: 6, y: 22 },
  { x: 14, y: 78 },
  { x: 23, y: 40 },
  { x: 31, y: 86 },
  { x: 39, y: 14 },
  { x: 47, y: 60 },
  { x: 55, y: 30 },
  { x: 63, y: 82 },
  { x: 71, y: 18 },
  { x: 79, y: 56 },
  { x: 87, y: 34 },
  { x: 94, y: 74 },
];
const SWEEP_START = 0.15;
const SWEEP_DURATION = 0.85;

function Wordmark() {
  return (
    <>
      <span className="fd-intro-mark">
        <Sparkles className="size-7" strokeWidth={2.2} />
      </span>
      <span className="fd-intro-name">{BUSINESS_INFO.brandName}</span>
    </>
  );
}

export function Intro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div className="fd-intro" aria-hidden="true">
        <div className="fd-intro-center">
          <div className="fd-intro-logo">
            {/* Dusty logo underneath… */}
            <div className="fd-intro-row fd-intro-dusty">
              <Wordmark />
            </div>
            {/* …and the clean one, revealed by the sweep. */}
            <div className="fd-intro-row fd-intro-cleaned">
              <Wordmark />
            </div>
            {SPECKS.map((s) => (
              <span
                key={s.x}
                className="fd-intro-speck"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  animationDelay: `${(SWEEP_START + (s.x / 100) * SWEEP_DURATION - 0.06).toFixed(2)}s`,
                }}
              />
            ))}
            <span className="fd-intro-line" />
          </div>
          <p className="fd-intro-tag">{BUSINESS_INFO.tagline}</p>
        </div>
      </div>
    </>
  );
}
