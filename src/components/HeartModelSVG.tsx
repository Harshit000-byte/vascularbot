'use client';

import React from 'react';

interface HeartModelSVGProps {
  width: number;
  height: number;
  isHeartbeatActive: boolean;
  showLabels?: boolean;
}

/**
 * Anatomically detailed SVG heart illustration with live biological cardiac beating,
 * coronary artery anatomy (LAD, LCx, RCA), and directional flow indicators.
 * Coordinate space: 900 x 650
 */
export const HeartModelSVG: React.FC<HeartModelSVGProps> = ({
  width,
  height,
  isHeartbeatActive,
  showLabels = true
}) => {
  return (
    <svg
      viewBox="0 0 900 650"
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Myocardium gradient — deep oxygenated ventricular muscle */}
        <radialGradient id="myocardiumGrad" cx="48%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#881337" stopOpacity="0.96" />
          <stop offset="45%" stopColor="#5b1212" stopOpacity="0.96" />
          <stop offset="85%" stopColor="#3b0a0a" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#250505" stopOpacity="1" />
        </radialGradient>

        {/* Left ventricle muscle */}
        <radialGradient id="lvGrad" cx="38%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#9f1239" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#660d1b" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#3b060d" stopOpacity="1" />
        </radialGradient>

        {/* Right ventricle muscle */}
        <radialGradient id="rvGrad" cx="62%" cy="48%" r="55%">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#4c1d95" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#2e1065" stopOpacity="0.75" />
        </radialGradient>

        {/* Left Atrium */}
        <radialGradient id="laGrad" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#be123c" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#70091e" stopOpacity="0.95" />
        </radialGradient>

        {/* Right Atrium */}
        <radialGradient id="raGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.65" />
        </radialGradient>

        {/* Aorta — bright arterial red */}
        <linearGradient id="aortaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#dc2626" stopOpacity="1" />
          <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.95" />
        </linearGradient>

        {/* Pulmonary Artery trunk */}
        <linearGradient id="paGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.98" />
        </linearGradient>

        {/* Vena Cava */}
        <linearGradient id="vcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.95" />
        </linearGradient>

        {/* Coronary Artery Glowing Red */}
        <linearGradient id="coronaryArteryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="40%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>

        {/* Coronary Vein Sapphire Blue */}
        <linearGradient id="coronaryVeinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Pericardium outer glow */}
        <filter id="heartGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={isHeartbeatActive ? "12" : "6"} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="arteryGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Animated flow markers */}
        <marker id="flowArrowRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fca5a5" />
        </marker>

        <marker id="flowArrowBlue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#93c5fd" />
        </marker>
      </defs>

      {/* ─── LIVE BEATING HEART GROUP ────────────────────────────────────────── */}
      <g className={isHeartbeatActive ? "heart-systole-active" : "heart-natural-beat"} style={{ transformOrigin: "445px 335px" }}>
        
        {/* Pericardium Outer Protective Sac */}
        <ellipse
          cx="445" cy="335" rx="205" ry="228"
          fill="none"
          stroke="#9f1239"
          strokeWidth="1.5"
          strokeDasharray="6 5"
          opacity="0.32"
        />

        {/* ─── GREAT VESSELS (AORTA, VENA CAVA, PULMONARY TRUNK) ──────────── */}
        {/* Superior Vena Cava (SVC) */}
        <path
          d="M 520 75 L 520 120 Q 520 148 500 156 L 488 162"
          fill="none" stroke="url(#vcGrad)" strokeWidth="24" strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 520 75 L 520 120 Q 520 148 500 156 L 488 162"
          fill="none" stroke="#1e40af" strokeWidth="16" strokeLinecap="round"
          opacity="0.8"
        />

        {/* Inferior Vena Cava (IVC) */}
        <path
          d="M 507 515 L 505 480 Q 503 455 495 445"
          fill="none" stroke="url(#vcGrad)" strokeWidth="22" strokeLinecap="round"
          opacity="0.88"
        />

        {/* Pulmonary Trunk & Left/Right Branches */}
        <path
          d="M 400 168 Q 380 145 365 125 Q 345 100 335 82 Q 318 58 295 55 Q 268 52 258 72 Q 248 94 262 112 Q 278 132 305 138 Q 330 143 355 148"
          fill="none" stroke="url(#paGrad)" strokeWidth="28" strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 400 168 Q 380 145 365 125 Q 345 100 335 82 Q 318 58 295 55 Q 268 52 258 72 Q 248 94 262 112 Q 278 132 305 138 Q 330 143 355 148"
          fill="none" stroke="#7c3aed" strokeWidth="18" strokeLinecap="round"
          opacity="0.85"
        />

        {/* Ascending Aorta & Arch (High-pressure oxygenated conduit) */}
        <path
          d="M 440 155 Q 430 120 432 88 Q 435 64 456 50 Q 482 38 502 54 Q 522 74 516 102 Q 508 124 490 148"
          fill="none" stroke="url(#aortaGrad)" strokeWidth="34" strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d="M 440 155 Q 430 120 432 88 Q 435 64 456 50 Q 482 38 502 54 Q 522 74 516 102 Q 508 124 490 148"
          fill="none" stroke="#f87171" strokeWidth="22" strokeLinecap="round"
          opacity="0.8"
        />
        {/* Aortic Arch inner lumen reflex */}
        <path
          d="M 450 152 Q 442 122 444 94 Q 446 72 462 60 Q 480 50 498 64 Q 512 80 508 104 Q 502 122 485 145"
          fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round"
          opacity="0.45"
        />

        {/* Brachiocephalic, Carotid & Subclavian Branches on Arch */}
        <line x1="462" y1="52" x2="455" y2="28" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
        <line x1="478" y1="46" x2="475" y2="24" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
        <line x1="494" y1="48" x2="497" y2="28" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />

        {/* ─── HEART CHAMBERS (WALLS & MUSCULATURE) ─────────────────────────── */}
        {/* Right Ventricle */}
        <path
          d="M 462 185 Q 510 190 542 210 Q 570 230 575 270 Q 580 310 565 350 Q 548 388 520 415 Q 498 435 472 448 Q 450 455 440 450 Q 445 400 448 360 Q 450 320 452 285 Q 453 240 462 185 Z"
          fill="url(#rvGrad)"
          stroke="#7c3aed"
          strokeWidth="2.5"
          opacity="0.75"
        />

        {/* Left Ventricle (Thick dominant myocardium) */}
        <path
          d="M 442 185 Q 395 190 358 218 Q 318 248 302 290 Q 285 335 292 378 Q 300 418 325 448 Q 350 475 390 488 Q 418 497 435 490 Q 450 484 458 470 Q 466 455 465 438 Q 460 405 455 370 Q 450 330 448 295 Q 445 245 442 185 Z"
          fill="url(#lvGrad)"
          stroke="#e11d48"
          strokeWidth="3.5"
          opacity="0.9"
        />

        {/* Right Atrium */}
        <path
          d="M 475 162 Q 510 158 535 170 Q 558 183 562 205 Q 565 225 550 240 Q 535 255 512 255 Q 490 255 476 242 Q 462 230 460 210 Q 458 188 475 162 Z"
          fill="url(#raGrad)"
          stroke="#8b5cf6"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Left Atrium */}
        <path
          d="M 420 162 Q 385 158 362 170 Q 340 183 336 205 Q 332 225 345 240 Q 358 255 382 258 Q 404 260 420 248 Q 435 235 440 215 Q 443 195 440 178 Q 432 164 420 162 Z"
          fill="url(#laGrad)"
          stroke="#f43f5e"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* ─── EPICARDIUM MAIN SILHOUETTE BODY ────────────────────────────── */}
        <path
          d="M 445 160
             Q 390 155 355 175
             Q 290 210 270 270
             Q 248 335 260 388
             Q 275 445 320 480
             Q 365 515 410 530
             Q 430 538 445 535
             Q 460 538 480 530
             Q 525 515 560 480
             Q 600 445 615 390
             Q 630 336 610 275
             Q 592 218 545 182
             Q 510 160 475 158
             Z"
          fill="url(#myocardiumGrad)"
          stroke="#9f1239"
          strokeWidth="3.5"
          opacity={isHeartbeatActive ? 0.88 : 0.78}
          filter="url(#heartGlow)"
        />

        {/* Interventricular Septum (Anterior groove depth) */}
        <path
          d="M 446 178 Q 440 220 435 270 Q 430 320 430 370 Q 428 410 432 450 Q 438 490 445 530"
          fill="none"
          stroke="#1e0404"
          strokeWidth="8"
          opacity="0.5"
          strokeLinecap="round"
        />

        {/* ─── CORONARY ARTERY TREE (EMBEDDED ANATOMICAL HIGHLIGHTS) ────────── */}
        
        {/* 1. LMCA & LAD (Left Anterior Descending) — The "Widowmaker" Artery */}
        {/* LAD main trunk descending anterior interventricular sulcus */}
        <path
          d="M 445 165 L 420 200 L 395 225 L 390 285 L 400 345 L 415 405 L 442 525"
          fill="none"
          stroke="url(#coronaryArteryGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#arteryGlow)"
          opacity="0.95"
        />
        {/* LAD Pulsing animated inner streamline */}
        <path
          d="M 445 165 L 420 200 L 395 225 L 390 285 L 400 345 L 415 405 L 442 525"
          fill="none"
          stroke="#ffe4e6"
          strokeWidth="2.2"
          strokeDasharray="10 12"
          strokeLinecap="round"
          className="streamline-flow-down"
          opacity="0.9"
        />
        {/* LAD Diagonal Branches (D1, D2) */}
        <path
          d="M 395 225 Q 375 240 355 255"
          fill="none" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" opacity="0.9"
        />
        <path
          d="M 390 285 Q 365 295 345 305"
          fill="none" stroke="#f43f5e" strokeWidth="3.2" strokeLinecap="round" opacity="0.9"
        />

        {/* 2. LCx (Left Circumflex Artery) — wrapping lateral LV wall */}
        <path
          d="M 420 200 Q 405 210 350 235 Q 330 275 295 305 Q 305 350 330 400 Q 345 425 355 435"
          fill="none"
          stroke="url(#coronaryArteryGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#arteryGlow)"
          opacity="0.95"
        />
        {/* LCx Pulsing animated inner streamline */}
        <path
          d="M 420 200 Q 405 210 350 235 Q 330 275 295 305 Q 305 350 330 400 Q 345 425 355 435"
          fill="none"
          stroke="#ffe4e6"
          strokeWidth="2"
          strokeDasharray="9 11"
          strokeLinecap="round"
          className="streamline-flow-down"
          opacity="0.9"
        />
        {/* Obtuse Marginal branches (OM1, OM2) */}
        <path d="M 350 235 Q 330 245 315 260" fill="none" stroke="#f43f5e" strokeWidth="2.8" opacity="0.85" />
        <path d="M 295 305 Q 280 325 272 345" fill="none" stroke="#f43f5e" strokeWidth="2.5" opacity="0.8" />

        {/* 3. RCA (Right Coronary Artery) — descending right atrioventricular groove */}
        <path
          d="M 455 185 Q 490 200 525 215 Q 505 255 545 285 Q 510 310 465 365 Q 490 400 480 435"
          fill="none"
          stroke="url(#coronaryArteryGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#arteryGlow)"
          opacity="0.95"
        />
        {/* RCA Pulsing animated inner streamline */}
        <path
          d="M 455 185 Q 490 200 525 215 Q 505 255 545 285 Q 510 310 465 365 Q 490 400 480 435"
          fill="none"
          stroke="#ffe4e6"
          strokeWidth="2"
          strokeDasharray="9 11"
          strokeLinecap="round"
          className="streamline-flow-down"
          opacity="0.9"
        />
        {/* Acute Marginal Branch (RCA) */}
        <path d="M 505 255 Q 535 270 565 278" fill="none" stroke="#f43f5e" strokeWidth="2.8" opacity="0.85" />

        {/* 4. Coronary Venous Return (Great Cardiac Vein & Coronary Sinus) */}
        <path
          d="M 380 185 Q 420 175 450 170 Q 490 185 500 195"
          fill="none"
          stroke="url(#coronaryVeinGrad)"
          strokeWidth="5.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* ─── VALVES & APEX ─────────────────────────────────────────────────── */}
        {/* Aortic Valve Ostium */}
        <ellipse cx="445" cy="165" rx="16" ry="11" fill="#b91c1c" stroke="#fca5a5" strokeWidth="2" opacity="0.95" />
        
        {/* Apex */}
        <ellipse cx="445" cy="530" rx="22" ry="12" fill="#260404" stroke="#9f1239" strokeWidth="2" opacity="0.9" />

        {/* Systolic Pressure Shockwave Rings on pulse */}
        {isHeartbeatActive && (
          <>
            <ellipse
              cx="445" cy="335" rx="215" ry="238"
              fill="none" stroke="#f43f5e" strokeWidth="3" opacity="0.5"
              className="pulse-shockwave-1"
            />
            <ellipse
              cx="445" cy="335" rx="230" ry="255"
              fill="none" stroke="#fb7185" strokeWidth="1.8" opacity="0.3"
              className="pulse-shockwave-2"
            />
          </>
        )}
      </g>

      {/* ─── ANATOMICAL CALLOUT LABELS & ARTERY ROAD SIGNS ───────────────────── */}
      {showLabels && (
        <g className="anatomical-labels select-none">
          {/* Aorta Callout */}
          <g transform="translate(320, 45)">
            <rect x="0" y="0" width="115" height="24" rx="6" fill="#0f172a" fillOpacity="0.88" stroke="#ef4444" strokeWidth="1.2" />
            <text x="58" y="15" fill="#fca5a5" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              ASCENDING AORTA
            </text>
            <line x1="115" y1="18" x2="135" y2="35" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2 2" />
          </g>

          {/* Catheter Entry Port */}
          <g transform="translate(540, 140)">
            <rect x="0" y="0" width="135" height="24" rx="6" fill="#042f2e" fillOpacity="0.9" stroke="#14b8a6" strokeWidth="1.4" />
            <text x="68" y="15" fill="#5eead4" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              CATHETER PORT (START)
            </text>
            <line x1="0" y1="12" x2="-75" y2="25" stroke="#14b8a6" strokeWidth="1.4" strokeDasharray="3 2" />
          </g>

          {/* LAD Callout (Left Anterior Descending) */}
          <g transform="translate(190, 240)">
            <rect x="0" y="0" width="145" height="34" rx="7" fill="#18070d" fillOpacity="0.92" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="72" y="15" fill="#fda4af" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              LAD ARTERY (ANTERIOR)
            </text>
            <text x="72" y="27" fill="#f43f5e" fontSize="8" fontFamily="monospace" textAnchor="middle">
              High Velocity Arterial Flow ↓
            </text>
            <line x1="145" y1="17" x2="200" y2="245" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 2" />
          </g>

          {/* LCx Callout (Left Circumflex) */}
          <g transform="translate(120, 360)">
            <rect x="0" y="0" width="140" height="32" rx="7" fill="#18070d" fillOpacity="0.92" stroke="#fb7185" strokeWidth="1.4" />
            <text x="70" y="14" fill="#fecdd3" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              LCx (CIRCUMFLEX)
            </text>
            <text x="70" y="26" fill="#fda4af" fontSize="8" fontFamily="monospace" textAnchor="middle">
              Wraps Lateral LV Margin
            </text>
            <line x1="140" y1="16" x2="185" y2="350" stroke="#fb7185" strokeWidth="1.4" strokeDasharray="3 2" />
          </g>

          {/* RCA Callout (Right Coronary Artery) */}
          <g transform="translate(635, 260)">
            <rect x="0" y="0" width="140" height="32" rx="7" fill="#18070d" fillOpacity="0.92" stroke="#f43f5e" strokeWidth="1.4" />
            <text x="70" y="14" fill="#fda4af" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              RCA (RIGHT CORONARY)
            </text>
            <text x="70" y="26" fill="#f43f5e" fontSize="8" fontFamily="monospace" textAnchor="middle">
              Feeds Right AV & PDA ↓
            </text>
            <line x1="0" y1="16" x2="-85" y2="255" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="3 2" />
          </g>

          {/* Chamber Names */}
          <text x="350" y="360" fill="#fecdd3" fontSize="12" fontWeight="bold" fontFamily="monospace" opacity="0.4" textAnchor="middle">
            LEFT VENTRICLE
          </text>
          <text x="535" y="350" fill="#ddd6fe" fontSize="11" fontWeight="bold" fontFamily="monospace" opacity="0.38" textAnchor="middle">
            RIGHT VENTRICLE
          </text>
          <text x="445" y="555" fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace" opacity="0.75" textAnchor="middle">
            CARDIAC APEX
          </text>
        </g>
      )}

      {/* ─── KEYFRAME ANIMATIONS ───────────────────────────────────────────── */}
      <style>{`
        /* Natural resting cardiac lub-dub cycle (approx 70 BPM) */
        .heart-natural-beat {
          animation: natural-lub-dub 1.05s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }

        /* Systolic surge when heartbeat is toggled / spiked */
        .heart-systole-active {
          animation: systolic-surge 0.68s cubic-bezier(0.18, 0.89, 0.32, 1.28) infinite;
        }

        @keyframes natural-lub-dub {
          0% { transform: scale(1); }
          12% { transform: scale(1.026); }   /* Atrial kick */
          24% { transform: scale(0.985); }   /* Isovolumetric contraction */
          38% { transform: scale(1.042); }   /* Ventricular ejection peak */
          62% { transform: scale(0.992); }   /* Ventricular relaxation */
          100% { transform: scale(1); }
        }

        @keyframes systolic-surge {
          0% { transform: scale(1); }
          10% { transform: scale(1.045); }
          22% { transform: scale(0.975); }
          36% { transform: scale(1.075); }   /* Powerful systolic ejection */
          55% { transform: scale(0.988); }
          100% { transform: scale(1); }
        }

        /* Continuous forward arterial blood stream flow */
        .streamline-flow-down {
          animation: dash-flow 1.2s linear infinite;
        }

        @keyframes dash-flow {
          to { stroke-dashoffset: -22; }
        }

        /* Systolic pressure waves */
        .pulse-shockwave-1 {
          animation: shockwave 0.8s ease-out infinite;
          transform-origin: 445px 335px;
        }
        .pulse-shockwave-2 {
          animation: shockwave 0.8s ease-out infinite 0.18s;
          transform-origin: 445px 335px;
        }

        @keyframes shockwave {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.06); opacity: 0; }
        }
      `}</style>
    </svg>
  );
};
