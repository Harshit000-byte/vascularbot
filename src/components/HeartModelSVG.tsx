'use client';

import React from 'react';

interface HeartModelSVGProps {
  width: number;
  height: number;
  isHeartbeatActive: boolean;
  showLabels?: boolean;
}

/**
 * Anatomically accurate SVG heart illustration.
 * Coordinate space: 900 x 650
 * Chambers, great vessels, and coronary grooves are drawn to scale.
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
        {/* Myocardium gradient — dark red muscle tissue */}
        <radialGradient id="myocardiumGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#5b1212" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#3b0a0a" stopOpacity="1" />
        </radialGradient>

        {/* Left ventricle — denser muscle */}
        <radialGradient id="lvGrad" cx="40%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#991b1b" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#450a0a" stopOpacity="0.95" />
        </radialGradient>

        {/* Right ventricle */}
        <radialGradient id="rvGrad" cx="60%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.5" />
        </radialGradient>

        {/* Left Atrium */}
        <radialGradient id="laGrad" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.9" />
        </radialGradient>

        {/* Right Atrium */}
        <radialGradient id="raGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.55" />
        </radialGradient>

        {/* Aorta */}
        <linearGradient id="aortaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b91c1c" stopOpacity="1" />
        </linearGradient>

        {/* Pulmonary Artery */}
        <linearGradient id="paGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.95" />
        </linearGradient>

        {/* Vena Cava */}
        <linearGradient id="vcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3730a3" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.95" />
        </linearGradient>

        {/* Pulmonary Veins */}
        <linearGradient id="pvGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0.85" />
        </linearGradient>

        {/* Pericardium outer glow */}
        <filter id="heartGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={isHeartbeatActive ? "10" : "5"} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Heartbeat pulse animation */}
        <filter id="pulseGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="vesselGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ─── Pericardium outer sac ───────────────────────────────────────── */}
      <ellipse
        cx="445" cy="340" rx="195" ry="220"
        fill="none"
        stroke="#7f1d1d"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.25"
      />

      {/* ─── GREAT VESSELS ───────────────────────────────────────────────── */}

      {/* Superior Vena Cava (SVC) — returns deoxygenated blood to RA */}
      <path
        d="M 520 80 L 520 120 Q 520 148 500 155 L 488 162"
        fill="none" stroke="url(#vcGrad)" strokeWidth="22" strokeLinecap="round"
        opacity="0.88"
      />
      <path
        d="M 520 80 L 520 120 Q 520 148 500 155 L 488 162"
        fill="none" stroke="#312e81" strokeWidth="16" strokeLinecap="round"
        opacity="0.7"
      />
      {showLabels && (
        <text x="545" y="105" fill="#818cf8" fontSize="11" fontFamily="monospace" opacity="0.9">
          Superior Vena Cava
        </text>
      )}

      {/* Inferior Vena Cava (IVC) */}
      <path
        d="M 507 510 L 505 480 Q 503 455 495 445"
        fill="none" stroke="url(#vcGrad)" strokeWidth="20" strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M 507 510 L 505 480 Q 503 455 495 445"
        fill="none" stroke="#312e81" strokeWidth="14" strokeLinecap="round"
        opacity="0.7"
      />
      {showLabels && (
        <text x="520" y="505" fill="#818cf8" fontSize="11" fontFamily="monospace" opacity="0.9">
          Inferior Vena Cava
        </text>
      )}

      {/* Pulmonary Veins — right (oxygenated blood returning to LA) */}
      <path
        d="M 620 240 Q 590 245 565 252 Q 545 258 530 268"
        fill="none" stroke="url(#pvGrad)" strokeWidth="14" strokeLinecap="round" opacity="0.8"
      />
      <path
        d="M 620 285 Q 590 280 565 278 Q 548 277 530 278"
        fill="none" stroke="url(#pvGrad)" strokeWidth="14" strokeLinecap="round" opacity="0.8"
      />
      {showLabels && (
        <text x="628" y="244" fill="#fca5a5" fontSize="10" fontFamily="monospace" opacity="0.85">
          R. Pulm. Veins
        </text>
      )}

      {/* Pulmonary Veins — left */}
      <path
        d="M 278 240 Q 310 245 338 252 Q 358 258 372 268"
        fill="none" stroke="url(#pvGrad)" strokeWidth="14" strokeLinecap="round" opacity="0.8"
      />
      <path
        d="M 278 282 Q 310 278 340 276 Q 358 275 372 278"
        fill="none" stroke="url(#pvGrad)" strokeWidth="14" strokeLinecap="round" opacity="0.8"
      />
      {showLabels && (
        <text x="218" y="243" fill="#fca5a5" fontSize="10" fontFamily="monospace" opacity="0.85">
          L. Pulm. Veins
        </text>
      )}

      {/* Ascending Aorta */}
      <path
        d="M 438 145 Q 430 120 432 90 Q 434 68 455 55 Q 480 42 498 58 Q 518 78 512 105 Q 505 125 488 145"
        fill="none" stroke="url(#aortaGrad)" strokeWidth="32" strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M 438 145 Q 430 120 432 90 Q 434 68 455 55 Q 480 42 498 58 Q 518 78 512 105 Q 505 125 488 145"
        fill="none" stroke="#dc2626" strokeWidth="22" strokeLinecap="round"
        opacity="0.85"
      />
      {/* Aortic arch inner */}
      <path
        d="M 448 148 Q 442 124 444 96 Q 446 76 462 64 Q 480 54 497 67 Q 512 82 506 107 Q 500 124 484 145"
        fill="none" stroke="#fca5a5" strokeWidth="6" strokeLinecap="round"
        opacity="0.4"
      />
      {showLabels && (
        <text x="345" y="72" fill="#f87171" fontSize="12" fontWeight="bold" fontFamily="monospace">
          Aortic Arch
        </text>
      )}

      {/* Pulmonary Artery Trunk */}
      <path
        d="M 400 168 Q 380 145 365 125 Q 345 100 335 82 Q 318 58 295 55 Q 268 52 258 72 Q 248 94 262 112 Q 278 132 305 138 Q 330 143 355 148"
        fill="none" stroke="url(#paGrad)" strokeWidth="26" strokeLinecap="round"
        opacity="0.88"
      />
      <path
        d="M 400 168 Q 380 145 365 125 Q 345 100 335 82 Q 318 58 295 55 Q 268 52 258 72 Q 248 94 262 112 Q 278 132 305 138 Q 330 143 355 148"
        fill="none" stroke="#8b5cf6" strokeWidth="17" strokeLinecap="round"
        opacity="0.8"
      />
      {showLabels && (
        <text x="222" y="52" fill="#a78bfa" fontSize="11" fontFamily="monospace" opacity="0.95">
          Pulmonary Trunk
        </text>
      )}

      {/* ─── HEART CHAMBERS ──────────────────────────────────────────────── */}

      {/* Right Ventricle (anterior, thin-walled, crescent shaped) */}
      <path
        d="M 462 185 Q 510 190 542 210 Q 570 230 575 270 Q 580 310 565 350 Q 548 388 520 415 Q 498 435 472 448 Q 450 455 440 450 Q 445 400 448 360 Q 450 320 452 285 Q 453 240 462 185 Z"
        fill="url(#rvGrad)"
        stroke="#7c3aed"
        strokeWidth="2.5"
        opacity="0.7"
      />
      {showLabels && (
        <text x="548" y="310" fill="#c4b5fd" fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.9">
          Right
        </text>
      )}
      {showLabels && (
        <text x="541" y="324" fill="#c4b5fd" fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.9">
          Ventricle
        </text>
      )}

      {/* Left Ventricle (dominant thick-walled muscle — left lateral) */}
      <path
        d="M 442 185 Q 395 190 358 218 Q 318 248 302 290 Q 285 335 292 378 Q 300 418 325 448 Q 350 475 390 488 Q 418 497 435 490 Q 450 484 458 470 Q 466 455 465 438 Q 460 405 455 370 Q 450 330 448 295 Q 445 245 442 185 Z"
        fill="url(#lvGrad)"
        stroke="#dc2626"
        strokeWidth="3"
        opacity="0.85"
      />
      {showLabels && (
        <text x="298" y="345" fill="#fca5a5" fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.9">
          Left
        </text>
      )}
      {showLabels && (
        <text x="290" y="360" fill="#fca5a5" fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.9">
          Ventricle
        </text>
      )}

      {/* Interventricular Septum line */}
      <path
        d="M 452 188 Q 450 285 452 380 Q 453 420 455 448"
        fill="none" stroke="#450a0a" strokeWidth="5" opacity="0.8"
        strokeDasharray="8 4"
      />

      {/* Right Atrium */}
      <path
        d="M 475 162 Q 510 158 535 170 Q 558 183 562 205 Q 565 225 550 240 Q 535 255 512 255 Q 490 255 476 242 Q 462 230 460 210 Q 458 188 475 162 Z"
        fill="url(#raGrad)"
        stroke="#7c3aed"
        strokeWidth="2"
        opacity="0.78"
      />
      {showLabels && (
        <text x="552" y="205" fill="#c4b5fd" fontSize="10" fontFamily="monospace" opacity="0.9">
          R.Atrium
        </text>
      )}

      {/* Left Atrium */}
      <path
        d="M 420 162 Q 385 158 362 170 Q 340 183 336 205 Q 332 225 345 240 Q 358 255 382 258 Q 404 260 420 248 Q 435 235 440 215 Q 443 195 440 178 Q 432 164 420 162 Z"
        fill="url(#laGrad)"
        stroke="#dc2626"
        strokeWidth="2"
        opacity="0.78"
      />
      {showLabels && (
        <text x="278" y="198" fill="#fca5a5" fontSize="10" fontFamily="monospace" opacity="0.9">
          L.Atrium
        </text>
      )}

      {/* ─── HEART SURFACE / EPICARDIUM ──────────────────────────────────── */}
      {/* Main heart silhouette outline */}
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
        stroke="#7f1d1d"
        strokeWidth="3.5"
        opacity={isHeartbeatActive ? 0.82 : 0.72}
        filter="url(#heartGlow)"
        className={isHeartbeatActive ? 'animate-pulse' : ''}
        style={{
          transform: isHeartbeatActive ? 'scale(1.018)' : 'scale(1)',
          transformOrigin: '445px 340px',
          transition: 'transform 0.25s ease-in-out'
        }}
      />

      {/* Epicardial surface highlight */}
      <path
        d="M 400 172 Q 360 180 330 210 Q 295 245 285 290"
        fill="none" stroke="#f87171" strokeWidth="2" opacity="0.25"
      />
      <path
        d="M 490 170 Q 530 178 560 208 Q 595 245 605 290"
        fill="none" stroke="#f87171" strokeWidth="2" opacity="0.2"
      />

      {/* ─── CORONARY GROOVES (anatomical sulci) ─────────────────────────── */}

      {/* Left Anterior Descending Groove (Anterior Interventricular Sulcus) */}
      <path
        d="M 446 178 Q 440 220 435 270 Q 430 320 430 370 Q 428 410 432 450"
        fill="none"
        stroke="#450a0a"
        strokeWidth="7"
        opacity="0.45"
        strokeLinecap="round"
      />

      {/* Left AV Groove (Coronary Sulcus — left) */}
      <path
        d="M 362 172 Q 345 185 335 200 Q 322 220 318 245"
        fill="none"
        stroke="#450a0a"
        strokeWidth="6"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Right AV Groove (Coronary Sulcus — right) */}
      <path
        d="M 480 162 Q 510 170 530 185 Q 550 200 558 222"
        fill="none"
        stroke="#350564"
        strokeWidth="6"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Posterior Descending Groove */}
      <path
        d="M 445 530 Q 450 490 460 455 Q 468 430 472 405"
        fill="none"
        stroke="#450a0a"
        strokeWidth="5"
        opacity="0.35"
        strokeLinecap="round"
      />

      {/* ─── AORTIC VALVE & PULMONARY VALVE rings ────────────────────────── */}
      <ellipse cx="455" cy="175" rx="18" ry="12"
        fill="#991b1b" stroke="#f87171" strokeWidth="2" opacity="0.85" />
      <text x="432" y="170" fill="#fca5a5" fontSize="8" fontFamily="monospace" opacity="0.7">AV</text>

      <ellipse cx="405" cy="173" rx="14" ry="10"
        fill="#6d28d9" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.75" />
      <text x="395" y="169" fill="#ddd6fe" fontSize="8" fontFamily="monospace" opacity="0.7">PV</text>

      {/* Mitral Valve */}
      <ellipse cx="420" cy="218" rx="18" ry="11"
        fill="#7f1d1d" stroke="#f87171" strokeWidth="1.5" opacity="0.6" />
      <text x="408" y="215" fill="#fca5a5" fontSize="8" fontFamily="monospace" opacity="0.6">MV</text>

      {/* Tricuspid Valve */}
      <ellipse cx="483" cy="218" rx="16" ry="11"
        fill="#4c1d95" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.55" />
      <text x="471" y="215" fill="#ddd6fe" fontSize="8" fontFamily="monospace" opacity="0.55">TV</text>

      {/* ─── APEX ────────────────────────────────────────────────────────── */}
      <ellipse cx="445" cy="530" rx="22" ry="12"
        fill="#3b0a0a" stroke="#7f1d1d" strokeWidth="2" opacity="0.8" />
      {showLabels && (
        <text x="456" y="534" fill="#f87171" fontSize="10" fontFamily="monospace" opacity="0.8">
          Apex
        </text>
      )}

      {/* ─── Heartbeat Pulse Ring (systolic expansion) ───────────────────── */}
      {isHeartbeatActive && (
        <>
          <ellipse
            cx="445" cy="340" rx="205" ry="230"
            fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.4"
            style={{ animation: 'pulse-ring 0.8s ease-out infinite' }}
          />
          <ellipse
            cx="445" cy="340" rx="220" ry="248"
            fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.2"
          />
        </>
      )}

      {/* ─── Chordae Tendineae (heart strings) ─────────────────────────── */}
      <line x1="420" y1="228" x2="408" y2="290" stroke="#7f1d1d" strokeWidth="1" opacity="0.3" />
      <line x1="425" y1="228" x2="430" y2="295" stroke="#7f1d1d" strokeWidth="1" opacity="0.3" />
      <line x1="483" y1="228" x2="470" y2="288" stroke="#4c1d95" strokeWidth="1" opacity="0.25" />
      <line x1="490" y1="228" x2="493" y2="292" stroke="#4c1d95" strokeWidth="1" opacity="0.25" />

      {/* ─── TITLE WATERMARK ─────────────────────────────────────────────── */}
      <text x="445" y="610" fill="#7f1d1d" fontSize="12" fontFamily="monospace"
        textAnchor="middle" opacity="0.5" letterSpacing="3">
        CARDIAC ANATOMY · VascularBot
      </text>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.04); opacity: 0; }
        }
      `}</style>
    </svg>
  );
};
