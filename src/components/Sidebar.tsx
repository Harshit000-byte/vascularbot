'use client';

import React, { useState } from 'react';
import {
  VascularNetwork,
  VascularNode,
  VascularEdge,
  DijkstraResult
} from '../types/vascular';
import { ECGMonitor } from './ECGMonitor';
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  Heart,
  Zap,
  Battery,
  Sliders,
  Sparkles,
  Info,
  Volume2,
  VolumeX,
  Target,
  Crosshair,
  Compass,
  FileText,
  AlertTriangle,
  ChevronDown,
  Gauge
} from 'lucide-react';
import { PRESET_NETWORKS } from '../data/networks';
import { generateProceduralNetwork } from '../data/generator';

interface SidebarProps {
  network: VascularNetwork;
  startNodeId: string;
  targetNodeId: string;
  onSelectStartNode: (id: string) => void;
  onSelectTargetNode: (id: string) => void;
  onSelectNetwork: (net: VascularNetwork) => void;
  // Simulation Controls
  isRunning: boolean;
  isPaused: boolean;
  hasReachedTarget: boolean;
  onStartSimulation: () => void;
  onPauseSimulation: () => void;
  onResetSimulation: () => void;
  // Heartbeat Controls
  isHeartbeatActive: boolean;
  onToggleHeartbeat: () => void;
  heartbeatMultiplier: number;
  onChangeHeartbeatMultiplier: (m: number) => void;
  autoHeartbeat: boolean;
  onToggleAutoHeartbeat: () => void;
  // Metrics
  liveEnergyDepleted: number;
  totalPathEnergy: number;
  progressPercent: number;
  dijkstraResult: DijkstraResult;
  // Algorithm parameters
  kConstant: number;
  onChangeKConstant: (k: number) => void;
  simulationSpeed: number;
  onChangeSimulationSpeed: (s: number) => void;
  // Inspection & Comparison
  selectedNodeId: string | null;
  selectedEdge: VascularEdge | null;
  onOpenComparison: () => void;
  // Audio
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  network,
  startNodeId,
  targetNodeId,
  onSelectStartNode,
  onSelectTargetNode,
  onSelectNetwork,
  isRunning,
  isPaused,
  hasReachedTarget,
  onStartSimulation,
  onPauseSimulation,
  onResetSimulation,
  isHeartbeatActive,
  onToggleHeartbeat,
  heartbeatMultiplier,
  onChangeHeartbeatMultiplier,
  autoHeartbeat,
  onToggleAutoHeartbeat,
  liveEnergyDepleted,
  totalPathEnergy,
  progressPercent,
  dijkstraResult,
  kConstant,
  onChangeKConstant,
  simulationSpeed,
  onChangeSimulationSpeed,
  selectedNodeId,
  selectedEdge,
  onOpenComparison,
  isMuted,
  onToggleMute
}) => {
  const [showConfig, setShowConfig] = useState(false);

  // Generate procedural network handler
  const handleGenerateProcedural = () => {
    const net = generateProceduralNetwork(4, 3);
    onSelectNetwork(net);
  };

  const selectedNode = network.nodes.find(n => n.id === selectedNodeId);

  return (
    <aside className="w-full h-full bg-[#0b1120] border-l border-slate-800 flex flex-col text-slate-200 select-none overflow-hidden">
      {/* 1. Header: Branding & Controls */}
      <div className="p-4 border-b border-slate-800 bg-[#0d1527] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black tracking-wider">
            VB
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white">VascularBot</h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Hemodynamic Dijkstra Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio Telemetry' : 'Mute Audio Telemetry'}
            className={`p-2 rounded-lg border transition-colors ${
              !isMuted
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenComparison}
            title="Algorithm Biophysics Benchmark"
            className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Network Preset Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Anatomical Model:</span>
            <button
              onClick={handleGenerateProcedural}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Generate Random
            </button>
          </div>
          <div className="relative">
            <select
              value={network.id.startsWith('procedural') ? 'procedural' : network.id}
              onChange={e => {
                const found = PRESET_NETWORKS.find(p => p.id === e.target.value);
                if (found) onSelectNetwork(found);
              }}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 appearance-none"
            >
              {PRESET_NETWORKS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              {network.id.startsWith('procedural') && (
                <option value="procedural">Procedural Network ({network.nodes.length} nodes)</option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
          {network.id === 'cardiac_coronary' && (
            <div className="flex items-center gap-1.5 text-[10px] text-rose-300 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded-lg">
              <Heart className="w-3 h-3 text-rose-400 fill-rose-500/30 animate-pulse" />
              <span>Real Heart Anatomy with embedded LAD, LCx & RCA arteries</span>
            </div>
          )}
        </div>

        {/* 2. Simulation Action Button: Start / Pause / Reset */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                onClick={onStartSimulation}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{hasReachedTarget ? 'Replay Simulation' : isPaused ? 'Resume Simulation' : 'Start Simulation'}</span>
              </button>
            ) : (
              <button
                onClick={onPauseSimulation}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Navigation</span>
              </button>
            )}

            <button
              onClick={onResetSimulation}
              title="Reset Simulation"
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Status Alert Banner */}
          {hasReachedTarget && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold">Tumor Neoplasm Reached!</span>
              <span className="text-[11px] text-emerald-400/80">Target neutralized.</span>
            </div>
          )}

          {isRunning && !hasReachedTarget && (
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Compass className="w-3.5 h-3.5 animate-spin" />
                Nanobot Navigating
              </span>
              <span>{progressPercent}% Complete</span>
            </div>
          )}
        </div>

        {/* 3. Live "Energy Depleted" Metric */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#101b33] border border-cyan-900/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 tracking-wider uppercase">
              <Battery className="w-4 h-4 text-cyan-400" />
              <span>Live Energy Depleted</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300/80 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
              Joule Metric
            </span>
          </div>

          {/* Main Glowing Number */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              {liveEnergyDepleted.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-cyan-300">nJ</span>
            <span className="text-xs text-slate-400 font-mono ml-auto">
              / {dijkstraResult.totalCost.toFixed(1)} nJ total
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-300 h-full transition-all duration-150 rounded-full shadow-[0_0_8px_#22d3ee]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0 nJ (Injection)</span>
              <span>Target: {dijkstraResult.totalCost.toFixed(1)} nJ</span>
            </div>
          </div>
        </div>

        {/* 4. Heartbeat Pulse Toggle & Waveform */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isHeartbeatActive ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-400'}`}>
                <Heart className={`w-4 h-4 ${isHeartbeatActive ? 'animate-bounce text-rose-500' : ''}`} />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Heartbeat Pulse</span>
                  {isHeartbeatActive && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isHeartbeatActive ? 'Systole Spiking Velocity' : 'Resting Flow Baseline'}
                </div>
              </div>
            </div>

            {/* Pulse Toggle Switch */}
            <button
              onClick={onToggleHeartbeat}
              className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isHeartbeatActive ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isHeartbeatActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Dynamic explanation note */}
          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            {isHeartbeatActive ? (
              <span className="text-rose-300 font-medium">
                Pulse active! Blood velocity spiked by {heartbeatMultiplier}x. Moving against flow penalty <code className="text-rose-400 font-mono">e^(k&middot;v)</code> is surging, forcing Dijkstra to recalculate live!
              </span>
            ) : (
              <span>
                Toggle pulse to simulate systolic ejection. High-velocity arteries will become exponentially harder to traverse, prompting dynamic path rerouting.
              </span>
            )}
          </p>

          {/* ECG Monitor */}
          <ECGMonitor isHeartbeatActive={isHeartbeatActive} velocityMultiplier={heartbeatMultiplier} />

          {/* Auto Pulse Option */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
            <span className="text-slate-400">Auto Rhythmic Pulse</span>
            <button
              onClick={onToggleAutoHeartbeat}
              className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                autoHeartbeat
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {autoHeartbeat ? 'Active (72 BPM)' : 'Off (Manual)'}
            </button>
          </div>
        </div>

        {/* 5. Start and Target Node Selectors */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Vascular Endpoints
            </span>
            <span className="text-[10px] text-slate-500">Route Endpoints</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Injection Site (Start):</label>
              <select
                value={startNodeId}
                onChange={e => onSelectStartNode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-cyan-300 font-mono focus:ring-1 focus:ring-cyan-500"
              >
                {network.nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label || n.id} ({n.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Target Tumor (Goal):</label>
              <select
                value={targetNodeId}
                onChange={e => onSelectTargetNode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-rose-300 font-mono focus:ring-1 focus:ring-rose-500"
              >
                {network.nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label || n.id} ({n.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 6. Current Path Route Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              Calculated Dijkstra Route
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              {dijkstraResult.path.length} Nodes
            </span>
          </div>

          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-nowrap">
            {dijkstraResult.path.length > 0 ? (
              dijkstraResult.path.map((nodeId, idx) => (
                <span key={nodeId}>
                  <span className={idx === 0 ? 'text-cyan-400 font-bold' : idx === dijkstraResult.path.length - 1 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                    {nodeId.replace('node_', '').replace('cor_', '').replace('hep_', '')}
                  </span>
                  {idx < dijkstraResult.path.length - 1 && (
                    <span className="text-emerald-500 font-bold mx-1">&rarr;</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-rose-400">No navigable path found</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
            <div className="flex justify-between bg-slate-950/50 p-1.5 rounded">
              <span>Path Distance:</span>
              <span className="font-mono text-white">{dijkstraResult.totalDistance.toFixed(0)} &mu;m</span>
            </div>
            <div className="flex justify-between bg-slate-950/50 p-1.5 rounded">
              <span>Path Cost:</span>
              <span className="font-mono text-emerald-400">{dijkstraResult.totalCost.toFixed(1)} nJ</span>
            </div>
          </div>
        </div>

        {/* 7. Biophysics & Parameter Tuning Collapsible */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full p-3 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Algorithm & Fluid Dynamics Settings
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
          </button>

          {showConfig && (
            <div className="p-3.5 pt-0 space-y-3 text-xs border-t border-slate-800/80">
              {/* Sensitivity constant k */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Sensitivity Constant (k):</span>
                  <span className="font-mono text-cyan-400">{kConstant.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.05"
                  value={kConstant}
                  onChange={e => onChangeKConstant(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-[10px] text-slate-500 block">Controls drag penalty: exp(k &middot; v)</span>
              </div>

              {/* Heartbeat pulse multiplier */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Systolic Pulse Spike Multiplier:</span>
                  <span className="font-mono text-rose-400">{heartbeatMultiplier.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="4.0"
                  step="0.1"
                  value={heartbeatMultiplier}
                  onChange={e => onChangeHeartbeatMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              {/* Simulation speed */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Nanobot Simulation Speed:</span>
                  <span className="font-mono text-teal-400">{simulationSpeed}x</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[0.5, 1, 2, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => onChangeSimulationSpeed(s)}
                      className={`py-1 rounded text-xs font-mono transition-colors ${
                        simulationSpeed === s
                          ? 'bg-teal-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 8. Selected Vessel / Node Telemetry Card */}
        {(selectedNode || selectedEdge) && (
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                {selectedNode ? 'Node Inspector' : 'Vessel Telemetry'}
              </span>
              <button
                onClick={() => {
                  /* Clear selection handled outside */
                }}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>

            {selectedNode && (
              <div className="text-xs space-y-1 font-mono text-slate-300">
                <div>ID: <span className="text-white font-bold">{selectedNode.id}</span></div>
                <div>Label: <span className="text-cyan-300">{selectedNode.label || 'None'}</span></div>
                <div>Type: <span className="text-amber-400 uppercase">{selectedNode.type}</span></div>
                <div>Position: ({selectedNode.x}, {selectedNode.y})</div>
              </div>
            )}

            {selectedEdge && (
              <div className="text-xs space-y-1 text-slate-300 font-mono">
                <div>Segment: <span className="text-white font-bold">{selectedEdge.name || 'Vessel'}</span></div>
                <div>Connection: {selectedEdge.source} &rarr; {selectedEdge.target}</div>
                <div>Radius (r): <span className="text-cyan-300">{selectedEdge.radius} &mu;m</span></div>
                <div>Length (L): <span className="text-cyan-300">{selectedEdge.length} &mu;m</span></div>
                <div>Base Velocity: <span className="text-rose-300">{selectedEdge.blood_velocity} cm/s</span></div>
                <div>Flow Direction: <span className="text-emerald-400">{selectedEdge.flow_direction}</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-[#090e1a] text-[10px] text-slate-400 flex items-center justify-between">
        <span>VascularBot Hemodynamics</span>
        <button
          onClick={onOpenComparison}
          className="text-cyan-400 hover:text-cyan-300 font-medium"
        >
          View Biophysics &rarr;
        </button>
      </div>
    </aside>
  );
};
