'use client';

import React, { useState } from 'react';
import {
  X,
  Presentation,
  Award,
  Zap,
  Activity,
  Heart,
  Network,
  Cpu,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Lightbulb,
  FileCode2,
  Sparkles
} from 'lucide-react';

interface PresentationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationGuideModal: React.FC<PresentationGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "Why VascularBot Beats Typical City Digital Twins",
      badge: "SLIDE 1 · PROJECT RATIONALE",
      icon: Award,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed text-sm">
            Most students default to a <strong className="text-white">standard 3D city digital twin</strong> where edge weights are simply static geographic distances (<code className="text-cyan-300">cost = distance</code>). While visually common, mathematically it demonstrates only the most trivial form of Dijkstra&apos;s algorithm.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30 space-y-2">
              <div className="font-bold text-rose-400 flex items-center gap-1.5">
                <span>✕ Typical City Digital Twin</span>
              </div>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                <li>Static edge weights that never change</li>
                <li>Trivial Euclidean distance metric</li>
                <li>No dynamic rerouting or fluid forces</li>
                <li>Overdone, clichéd demo topic</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>✓ VascularBot Bio-Navigational Model</span>
              </div>
              <ul className="space-y-1.5 text-emerald-200/90 list-disc list-inside">
                <li><strong className="text-white">Non-linear fluid physics</strong> (Poiseuille resistance)</li>
                <li><strong className="text-white">Direction-dependent costs</strong> (arterial vs venous)</li>
                <li><strong className="text-white">Dynamic systolic pulse</strong> triggers live path recalculation</li>
                <li>Real clinical nanorobotics application in oncology</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Key Presentation Quote:</strong> <em>&ldquo;Instead of a generic road map, we modeled targeted drug delivery in micro-vasculature, demonstrating that Dijkstra applies to any complex multidimensional cost function, including non-linear biophysical fluid dynamics.&rdquo;</em>
            </span>
          </div>
        </div>
      )
    },
    {
      title: "The Mathematical Cost Function & Biophysics",
      badge: "SLIDE 2 · MATHEMATICAL FORMULATION",
      icon: Cpu,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            In our model, the edge weight <code className="text-cyan-300">W(u, v)</code> represents the <strong className="text-white">nano-joule (nJ) propulsion energy</strong> consumed by a medical nanobot moving from vessel junction <code className="text-cyan-300">u</code> to <code className="text-cyan-300">v</code>:
          </p>

          <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/30 font-mono text-center space-y-1 text-xs">
            <div className="text-cyan-300 text-sm font-bold">
              Cost(u, v) = ( Length / Radius² ) × Penalty(flow)
            </div>
            <div className="text-slate-400 text-[11px] pt-1">
              Penalty = WITH Flow ? 1.0 : exp( k × Blood_Velocity )
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white">1. Hydraulic Resistance:</strong>
              <p className="text-slate-400">
                Derived from the Hagen-Poiseuille equation. Narrower capillary vessels (<code className="text-cyan-300">low r</code>) exert dramatically higher hydraulic drag than wide arterial trunks.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white">2. Exponential Counter-Current:</strong>
              <p className="text-slate-400">
                When moving against arterial flow (<code className="text-rose-400">target_to_source</code>), drag surges exponentially with fluid velocity, penalizing retrograde swimming.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Live Demonstration: Real-Time Systolic Rerouting",
      badge: "SLIDE 3 · LIVE DEMO STRATEGY",
      icon: Heart,
      content: (
        <div className="space-y-4 text-sm">
          <p className="text-slate-300 leading-relaxed">
            Here is your exact script to show the professors during the live demo:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className="text-white">Show the Baseline Path:</strong>
                <p className="text-slate-400 mt-0.5">With resting heartbeat, observe the green optimal route. It may traverse an arterial segment because resting velocity drag is manageable.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className="text-rose-300">Click &apos;Heartbeat Pulse&apos;:</strong>
                <p className="text-slate-400 mt-0.5">Toggle the pulse button. Watch the velocity surge 2.5×–3.5× and the ECG monitor spike. <strong className="text-white">Dijkstra immediately reroutes live</strong> away from turbulent arteries into collateral venous bypasses!</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className="text-emerald-300">Open the Benchmark Modal:</strong>
                <p className="text-slate-400 mt-0.5">Click the Lightning icon &quot;View Biophysics&quot; to show the side-by-side comparison: our Hemodynamic Dijkstra saves <strong className="text-white">30%–60% battery energy</strong> compared to standard Euclidean distance!</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Algorithmic Invariants & Step-by-Step Proof",
      badge: "SLIDE 4 · ALGORITHMIC RIGOR",
      icon: Network,
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 text-sm leading-relaxed">
            Our UI includes an interactive <strong className="text-white">Algorithm Tutor</strong> demonstrating Dijkstra&apos;s step-by-step execution:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <span className="font-bold text-cyan-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Greedy Choice Property
              </span>
              <p className="text-slate-400 leading-relaxed">
                At each step, the unsettled vertex <code className="text-cyan-300">u</code> with minimal provisional distance <code className="text-cyan-300">d[u]</code> is extracted from the min-heap priority queue. Because all edge costs <code className="text-white">w(u, v) &gt; 0</code>, <code className="text-cyan-300">d[u]</code> is guaranteed to be optimal.
              </p>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <span className="font-bold text-emerald-300 flex items-center gap-1">
                <FileCode2 className="w-3.5 h-3.5" />
                Edge Relaxation
              </span>
              <p className="text-slate-400 leading-relaxed">
                For every neighbor <code className="text-white">v</code> of <code className="text-white">u</code>:
                <br />
                <code className="text-emerald-400 font-mono">if d[u] + w(u, v) &lt; d[v]:</code>
                <br />
                <code className="text-slate-300 font-mono pl-3">d[v] = d[u] + w(u, v)</code>
                <br />
                <code className="text-slate-300 font-mono pl-3">prev[v] = u</code>
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
            <strong className="text-white">Time Complexity:</strong> <code className="text-cyan-300 font-mono">O((V + E) log V)</code> using a binary min-heap priority queue, with <code className="text-white">O(V)</code> vertex extractions and <code className="text-white">O(E)</code> key decrease operations.
          </div>
        </div>
      )
    },
    {
      title: "Quick Q&A Cheatsheet for Professors",
      badge: "SLIDE 5 · DEFENSE CHEATSHEET",
      icon: Sparkles,
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <strong className="text-cyan-300">Q: Can negative weights occur here?</strong>
            <p className="text-slate-400">
              <strong className="text-white">A:</strong> No. Even when swimming with the current, hydraulic friction and minimal propulsion ensure <code className="text-cyan-400">cost &gt; 0</code> everywhere, which satisfies Dijkstra&apos;s non-negative weight precondition. If negative weights existed, Bellman-Ford would be needed.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <strong className="text-rose-300">Q: Why did you choose Three.js for 3D visualization?</strong>
            <p className="text-slate-400">
              <strong className="text-white">A:</strong> React Three Fiber allows GPU-accelerated spatial rendering of microvascular anatomical coordinates, orbital camera controls, and volumetric depth cues that a 2D canvas cannot convey.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <strong className="text-emerald-300">Q: How is this superior to A* Search?</strong>
            <p className="text-slate-400">
              <strong className="text-white">A:</strong> A* requires an admissible heuristic (e.g. Euclidean straight-line distance). Because non-linear fluid drag can make a physically short route exponentially costly, standard distance heuristics can easily violate consistency or admissibility. Dijkstra guarantees global optimality without requiring heuristic tuning.
            </p>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-[#0b1424] border border-cyan-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#070d18]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 text-cyan-300 rounded-xl border border-cyan-500/30">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase">
                {slide.badge}
              </div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {slide.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {slide.content}
        </div>

        {/* Navigation Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#070d18] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx
                    ? 'w-7 bg-cyan-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
            <span className="text-xs text-slate-400 font-mono ml-2">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => {
                if (currentSlide < slides.length - 1) {
                  setCurrentSlide(prev => prev + 1);
                } else {
                  onClose();
                }
              }}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              {currentSlide === slides.length - 1 ? (
                <>Finish & Present <Sparkles className="w-3.5 h-3.5" /></>
              ) : (
                <>Next Slide <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
