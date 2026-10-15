'use client';

import React, { useRef, useEffect } from 'react';
import { Heart, Activity } from 'lucide-react';

interface ECGMonitorProps {
  isHeartbeatActive: boolean;
  velocityMultiplier: number;
}

export const ECGMonitor: React.FC<ECGMonitorProps> = ({
  isHeartbeatActive,
  velocityMultiplier
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataPointsRef = useRef<number[]>([]);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const maxPoints = 140;

    // Fill initial flat baseline
    if (dataPointsRef.current.length === 0) {
      dataPointsRef.current = new Array(maxPoints).fill(0.5);
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Generate next ECG point based on cardiac rhythm phase
      const speed = isHeartbeatActive ? 0.35 : 0.12;
      phaseRef.current = (phaseRef.current + speed) % (Math.PI * 2);
      const phase = phaseRef.current;

      let yVal = 0.5; // baseline

      // Simulate P-Q-R-S-T cardiac waveform
      if (phase > 0.8 && phase < 1.2) {
        // P-wave (atrial depolarization)
        yVal = 0.5 - Math.sin((phase - 0.8) / 0.4 * Math.PI) * 0.15;
      } else if (phase >= 1.3 && phase < 1.45) {
        // Q dip
        yVal = 0.5 + 0.15;
      } else if (phase >= 1.45 && phase < 1.65) {
        // R-peak (systolic spike!)
        const rHeight = isHeartbeatActive ? 0.95 : 0.65;
        yVal = 0.5 - rHeight;
      } else if (phase >= 1.65 && phase < 1.85) {
        // S dip
        yVal = 0.5 + 0.28;
      } else if (phase > 2.2 && phase < 2.7) {
        // T-wave (ventricular repolarization)
        yVal = 0.5 - Math.sin((phase - 2.2) / 0.5 * Math.PI) * 0.22;
      }

      dataPointsRef.current.push(yVal);
      if (dataPointsRef.current.length > maxPoints) {
        dataPointsRef.current.shift();
      }

      // Draw ECG Line
      ctx.beginPath();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = isHeartbeatActive ? '#f43f5e' : '#10b981';
      ctx.shadowColor = isHeartbeatActive ? '#f43f5e' : '#10b981';
      ctx.shadowBlur = 8;

      const stepX = width / (maxPoints - 1);
      dataPointsRef.current.forEach((val, idx) => {
        const x = idx * stepX;
        const y = val * height;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw glowing scan head point
      const lastIdx = dataPointsRef.current.length - 1;
      const lastX = lastIdx * stepX;
      const lastY = dataPointsRef.current[lastIdx] * height;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isHeartbeatActive]);

  const bpm = isHeartbeatActive ? Math.round(145 * (velocityMultiplier / 2)) : 72;

  return (
    <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 shadow-inner">
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <Heart className={`w-3.5 h-3.5 ${isHeartbeatActive ? 'text-rose-500 animate-ping' : 'text-emerald-400'}`} />
          <span className="font-semibold text-slate-200">HEMODYNAMIC ECG</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <span className={`${isHeartbeatActive ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
            {bpm} BPM
          </span>
          <span className="text-slate-500 text-[10px]">
            {isHeartbeatActive ? '(SYSTOLIC SPIKE)' : '(RESTING)'}
          </span>
        </div>
      </div>

      <div className="relative h-12 w-full bg-[#050b14] rounded-lg overflow-hidden border border-slate-800">
        <canvas ref={canvasRef} width={280} height={48} className="w-full h-full" />
      </div>
    </div>
  );
};
