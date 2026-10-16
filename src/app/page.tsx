'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import {
  Activity,
  BookOpen,
  GitBranch,
  Network,
  Orbit,
  Presentation,
  Sparkles
} from 'lucide-react';
import { VascularCanvas } from '../components/VascularCanvas';
import { Sidebar } from '../components/Sidebar';
import { DijkstraTutor } from '../components/DijkstraTutor';
import { AlgorithmComparisonModal } from '../components/AlgorithmComparisonModal';
import { PresentationGuideModal } from '../components/PresentationGuideModal';
import { useVascularSimulation } from '../hooks/useVascularSimulation';
import { useAudioEffects } from '../hooks/useAudioEffects';
import { PRESET_NETWORKS } from '../data/networks';

const Dijkstra3DGraph = dynamic(
  () => import('../components/Dijkstra3DGraph').then(module => module.Dijkstra3DGraph),
  {
    ssr: false,
    loading: () => <div className="graph-loading"><Orbit size={22} /><span>Building the 3D graph…</span></div>
  }
);

type VisualizationMode = 'graph' | 'anatomy';

export default function VascularBotPage() {
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('graph');
  const [stepIndex, setStepIndex] = useState(0);
  const [isTeachingPlaying, setIsTeachingPlaying] = useState(false);

  const {
    isMuted,
    setIsMuted,
    playHeartbeat,
    playStepChirp,
    playPathRecalculated,
    playSuccessFanfare
  } = useAudioEffects();

  const {
    network,
    startNodeId,
    setStartNodeId,
    targetNodeId,
    setTargetNodeId,
    kConstant,
    setKConstant,
    isHeartbeatActive,
    toggleHeartbeat,
    heartbeatMultiplier,
    setHeartbeatMultiplier,
    autoHeartbeatInterval,
    setAutoHeartbeatInterval,
    simulationSpeed,
    setSimulationSpeed,
    isRunning,
    isPaused,
    hasReachedTarget,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    dijkstraResult,
    baselineResult,
    nanobotPos,
    liveEnergyDepleted,
    progressPercent,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdge,
    setSelectedEdge,
    handleSelectNetwork
  } = useVascularSimulation({
    initialNetwork: PRESET_NETWORKS[0],
    onHeartbeatSound: playHeartbeat,
    onRecalculateSound: playPathRecalculated,
    onSuccessSound: playSuccessFanfare,
    onStepSound: playStepChirp
  });

  useEffect(() => {
    if (!isTeachingPlaying) return;
    if (stepIndex >= dijkstraResult.steps.length - 1) return;

    const timer = window.setTimeout(() => {
      const nextStep = Math.min(stepIndex + 1, dijkstraResult.steps.length - 1);
      setStepIndex(nextStep);
      if (nextStep >= dijkstraResult.steps.length - 1) setIsTeachingPlaying(false);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [isTeachingPlaying, stepIndex, dijkstraResult.steps.length]);

  const safeStepIndex = Math.max(-1, Math.min(stepIndex, dijkstraResult.steps.length - 1));
  const currentStep = safeStepIndex >= 0 ? dijkstraResult.steps[safeStepIndex] : undefined;
  const resetTeaching = () => {
    setStepIndex(0);
    setIsTeachingPlaying(false);
  };
  const toggleTeaching = () => {
    if (stepIndex >= dijkstraResult.steps.length - 1) setStepIndex(-1);
    setIsTeachingPlaying(value => !value);
  };

  return (
    <main className="app-shell">
      <header className="app-topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Activity size={21} strokeWidth={2.4} /></div>
          <div>
            <div className="brand-name">Vascular<span>Bot</span><span className="brand-lab">ALGORITHM STUDIO</span></div>
            <div className="brand-subtitle">A visual field guide to Dijkstra&apos;s shortest-path algorithm</div>
          </div>
        </div>
        <div className="topbar-meta">
          <button
            onClick={() => setIsPresentationOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs tracking-wide transition-all shadow-sm shadow-cyan-500/20 cursor-pointer"
            title="Open Viva & Project Defense Guide"
          >
            <Presentation size={14} className="text-cyan-400" />
            <span>Project Defense Deck</span>
          </button>
          <div className="topbar-divider" />
          <span className="live-pill"><i /> INTERACTIVE LESSON</span>
          <div className="topbar-divider" />
          <span className="topbar-stat"><Network size={15} /> {network.nodes.length} nodes</span>
          <span className="topbar-stat"><GitBranch size={15} /> {network.edges.length} edges</span>
          <span className="topbar-cost">{dijkstraResult.totalCost.toFixed(1)} <small>nJ</small></span>
        </div>
      </header>

      <div className="workspace-grid">
        <section className="visual-column">
          <div className="visual-card">
            <div className="visual-toolbar">
              <div className="visual-heading">
                <span className="section-kicker"><BookOpen size={13} /> THE SEARCH, IN MOTION</span>
                <h1>Finding the <em>lowest-cost</em> route</h1>
                <p>Each glowing label is the best-known distance from the source. Watch them improve.</p>
              </div>
              <div className="view-switch" role="tablist" aria-label="Visualization mode">
                <button className={visualizationMode === 'graph' ? 'active' : ''} onClick={() => setVisualizationMode('graph')} role="tab" aria-selected={visualizationMode === 'graph'}>
                  <Orbit size={15} /> 3D graph
                </button>
                <button className={visualizationMode === 'anatomy' ? 'active' : ''} onClick={() => setVisualizationMode('anatomy')} role="tab" aria-selected={visualizationMode === 'anatomy'}>
                  <Activity size={15} /> Anatomy
                </button>
              </div>
            </div>

            <div className="visual-stage">
              {visualizationMode === 'graph' ? (
                <Dijkstra3DGraph
                  nodes={network.nodes}
                  edges={network.edges}
                  result={dijkstraResult}
                  step={currentStep}
                  startNodeId={startNodeId}
                  targetNodeId={targetNodeId}
                  isHeartbeatActive={isHeartbeatActive}
                  selectedNodeId={selectedNodeId}
                  nanobotPos={nanobotPos}
                  onSelectNode={nodeId => { setSelectedNodeId(nodeId); setSelectedEdge(null); }}
                />
              ) : (
                <VascularCanvas
                  networkId={network.id}
                  nodes={network.nodes}
                  edges={network.edges}
                  dijkstraResult={dijkstraResult}
                  nanobotPos={nanobotPos}
                  startNodeId={startNodeId}
                  targetNodeId={targetNodeId}
                  isHeartbeatActive={isHeartbeatActive}
                  velocityMultiplier={heartbeatMultiplier}
                  kConstant={kConstant}
                  selectedNodeId={selectedNodeId}
                  selectedEdge={selectedEdge}
                  onSelectNode={nodeId => { setSelectedNodeId(nodeId); setSelectedEdge(null); }}
                  onSelectEdge={edge => { setSelectedEdge(edge); setSelectedNodeId(null); }}
                  onSetStartNode={setStartNodeId}
                  onSetTargetNode={setTargetNodeId}
                />
              )}
            </div>
            <div className="visual-caption">
              <span><Sparkles size={13} /> DISTANCE LABELS UPDATE AS THE FRONTIER EXPANDS</span>
              <span>WEIGHTED GRAPH <b>·</b> GREEDY SEARCH</span>
            </div>
          </div>

          <DijkstraTutor
            result={dijkstraResult}
            nodes={network.nodes}
            startNodeId={startNodeId}
            stepIndex={safeStepIndex}
            isPlaying={isTeachingPlaying}
            onStepChange={index => { setStepIndex(index); setIsTeachingPlaying(false); }}
            onTogglePlay={toggleTeaching}
            onReset={() => { setStepIndex(-1); setIsTeachingPlaying(false); }}
          />
        </section>

        <aside className="control-column" aria-label="Simulation controls">
          <Sidebar
            network={network}
            startNodeId={startNodeId}
            targetNodeId={targetNodeId}
            onSelectStartNode={nodeId => { resetTeaching(); setStartNodeId(nodeId); }}
            onSelectTargetNode={nodeId => { resetTeaching(); setTargetNodeId(nodeId); }}
            onSelectNetwork={nextNetwork => { resetTeaching(); handleSelectNetwork(nextNetwork); }}
            isRunning={isRunning}
            isPaused={isPaused}
            hasReachedTarget={hasReachedTarget}
            onStartSimulation={startSimulation}
            onPauseSimulation={pauseSimulation}
            onResetSimulation={resetSimulation}
            isHeartbeatActive={isHeartbeatActive}
            onToggleHeartbeat={() => { resetTeaching(); toggleHeartbeat(); }}
            heartbeatMultiplier={heartbeatMultiplier}
            onChangeHeartbeatMultiplier={value => { resetTeaching(); setHeartbeatMultiplier(value); }}
            autoHeartbeat={autoHeartbeatInterval}
            onToggleAutoHeartbeat={() => setAutoHeartbeatInterval(!autoHeartbeatInterval)}
            liveEnergyDepleted={liveEnergyDepleted}
            totalPathEnergy={dijkstraResult.totalCost}
            progressPercent={progressPercent}
            dijkstraResult={dijkstraResult}
            kConstant={kConstant}
            onChangeKConstant={value => { resetTeaching(); setKConstant(value); }}
            simulationSpeed={simulationSpeed}
            onChangeSimulationSpeed={setSimulationSpeed}
            selectedNodeId={selectedNodeId}
            selectedEdge={selectedEdge}
            onOpenComparison={() => setIsComparisonOpen(true)}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
          />
        </aside>
      </div>

      <div className="presentation-note"><span>BUILT TO EXPLAIN</span> Start with the source, repeatedly choose the nearest unsettled node, relax its neighbors, then trace predecessors back from the target.</div>

      <AlgorithmComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        hemodynamicResult={dijkstraResult}
        euclideanResult={baselineResult}
        kConstant={kConstant}
        velocityMultiplier={isHeartbeatActive ? heartbeatMultiplier : 1.0}
      />

      <PresentationGuideModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />
    </main>
  );
}
