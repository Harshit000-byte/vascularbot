'use client';

import React from 'react';
import { DijkstraResult, VascularEdge } from '../types/vascular';
import { X, Zap, Route, ShieldAlert, Award, ArrowRight, Gauge, Cpu } from 'lucide-react';

interface AlgorithmComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  hemodynamicResult: DijkstraResult;
  euclideanResult: DijkstraResult & { energyCostOnThisPath: number };
  kConstant: number;
  velocityMultiplier: number;
}

export const AlgorithmComparisonModal: React.FC<AlgorithmComparisonModalProps> = ({
  isOpen,
  onClose,
  hemodynamicResult,
  euclideanResult,
  kConstant,
  velocityMultiplier
}) => {
  if (!isOpen) return null;

  const hemoEnergy = hemodynamicResult.totalCost;
  const standardEnergy = euclideanResult.energyCostOnThisPath;
  const savedEnergy = Math.max(0, standardEnergy - hemoEnergy);
  const percentSaved = standardEnergy > 0 ? Math.round((savedEnergy / standardEnergy) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Algorithm Benchmark & Biophysics</h3>
              <p className="text-xs text-slate-400">Hemodynamic Energy Dijkstra vs Standard Euclidean Dijkstra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Energy Savings Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
                <Award className="w-4 h-4" />
                Nanobot Energy Optimization
              </div>
              <div className="text-2xl font-black text-white">
                {percentSaved}% Battery Conserved
              </div>
              <p className="text-xs text-slate-300 mt-1">
                VascularBot avoids high-velocity counter-currents, saving {savedEnergy.toFixed(1)} nJ of nanobot fuel.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono font-bold text-emerald-400">
                {hemoEnergy.toFixed(1)} <span className="text-xs text-emerald-300 font-normal">nJ</span>
              </span>
              <div className="text-[11px] text-slate-400">Optimal Path Cost</div>
            </div>
          </div>

          {/* Side by Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* VascularBot Hemodynamic */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  VascularBot (Hemodynamic)
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Custom Dijkstra
                </span>
              </div>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Energy Cost:</span>
                  <span className="font-mono font-bold text-emerald-400">{hemodynamicResult.totalCost.toFixed(2)} nJ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vessel Path Length:</span>
                  <span className="font-mono text-slate-200">{hemodynamicResult.totalDistance.toFixed(0)} &mu;m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Path Node Count:</span>
                  <span className="font-mono text-slate-200">{hemodynamicResult.path.length} nodes</span>
                </div>
              </div>

              <div className="text-[11px] bg-slate-900/60 p-2 rounded-lg text-slate-300 border border-slate-700/50">
                <span className="text-slate-400 font-medium">Path: </span>
                <span className="font-mono text-emerald-300">{hemodynamicResult.path.join(' → ')}</span>
              </div>
            </div>

            {/* Standard Euclidean Distance */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Route className="w-4 h-4" />
                  Standard Euclidean
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Length Only
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Actual Energy If Taken:</span>
                  <span className="font-mono font-bold text-rose-400">{euclideanResult.energyCostOnThisPath.toFixed(2)} nJ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vessel Path Length:</span>
                  <span className="font-mono text-slate-200">{euclideanResult.totalDistance.toFixed(0)} &mu;m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Path Node Count:</span>
                  <span className="font-mono text-slate-200">{euclideanResult.path.length} nodes</span>
                </div>
              </div>

              <div className="text-[11px] bg-slate-900/60 p-2 rounded-lg text-slate-300 border border-slate-700/50">
                <span className="text-slate-400 font-medium">Path: </span>
                <span className="font-mono text-amber-300">{euclideanResult.path.join(' → ')}</span>
              </div>
            </div>
          </div>

          {/* Mathematical Specification */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Weight Function Specification
            </h4>
            <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs text-cyan-300 border border-slate-800">
              Cost = (length / (radius^2)) * penalty
              <br />
              penalty = WITH flow ? 1.0 : exp(k * blood_velocity)
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div>&bull; <strong className="text-slate-200">Length / radius&sup2;:</strong> Poiseuille hydraulic impedance resistance in cylindrical micro-channels.</div>
              <div>&bull; <strong className="text-slate-200">exp(k &middot; v):</strong> Exponential thrust drag required to combat hydrodynamic fluid flux ($k = {kConstant}$).</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};
