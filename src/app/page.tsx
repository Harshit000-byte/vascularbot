'use client';

import React, { useState } from 'react';
import { VascularCanvas } from '../components/VascularCanvas';
import { Sidebar } from '../components/Sidebar';
import { AlgorithmComparisonModal } from '../components/AlgorithmComparisonModal';
import { useVascularSimulation } from '../hooks/useVascularSimulation';
import { useAudioEffects } from '../hooks/useAudioEffects';
import { PRESET_NETWORKS } from '../data/networks';

export default function VascularBotPage() {
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Audio Telemetry Synthesizer
  const {
    isMuted,
    setIsMuted,
    playHeartbeat,
    playStepChirp,
    playPathRecalculated,
    playSuccessFanfare
  } = useAudioEffects();

  // Core Simulation & Hemodynamic Dijkstra Engine
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

  return (
    <main className="flex flex-col lg:flex-row w-screen h-screen overflow-hidden bg-[#060a12] text-slate-100 font-sans">
      {/* 1. Main Canvas (70% Screen Width) */}
      <section className="relative w-full lg:w-[70%] h-[55vh] lg:h-full border-b lg:border-b-0 lg:border-r border-slate-800">
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
          onSelectNode={nodeId => {
            setSelectedNodeId(nodeId);
            setSelectedEdge(null);
          }}
          onSelectEdge={edge => {
            setSelectedEdge(edge);
            setSelectedNodeId(null);
          }}
          onSetStartNode={setStartNodeId}
          onSetTargetNode={setTargetNodeId}
        />
      </section>

      {/* 2. Sidebar (30% Screen Width) */}
      <section className="w-full lg:w-[30%] h-[45vh] lg:h-full">
        <Sidebar
          network={network}
          startNodeId={startNodeId}
          targetNodeId={targetNodeId}
          onSelectStartNode={setStartNodeId}
          onSelectTargetNode={setTargetNodeId}
          onSelectNetwork={handleSelectNetwork}
          isRunning={isRunning}
          isPaused={isPaused}
          hasReachedTarget={hasReachedTarget}
          onStartSimulation={startSimulation}
          onPauseSimulation={pauseSimulation}
          onResetSimulation={resetSimulation}
          isHeartbeatActive={isHeartbeatActive}
          onToggleHeartbeat={toggleHeartbeat}
          heartbeatMultiplier={heartbeatMultiplier}
          onChangeHeartbeatMultiplier={setHeartbeatMultiplier}
          autoHeartbeat={autoHeartbeatInterval}
          onToggleAutoHeartbeat={() => setAutoHeartbeatInterval(!autoHeartbeatInterval)}
          liveEnergyDepleted={liveEnergyDepleted}
          totalPathEnergy={dijkstraResult.totalCost}
          progressPercent={progressPercent}
          dijkstraResult={dijkstraResult}
          kConstant={kConstant}
          onChangeKConstant={setKConstant}
          simulationSpeed={simulationSpeed}
          onChangeSimulationSpeed={setSimulationSpeed}
          selectedNodeId={selectedNodeId}
          selectedEdge={selectedEdge}
          onOpenComparison={() => setIsComparisonOpen(true)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
        />
      </section>

      {/* 3. Algorithm Biophysics Comparison Modal */}
      <AlgorithmComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        hemodynamicResult={dijkstraResult}
        euclideanResult={baselineResult}
        kConstant={kConstant}
        velocityMultiplier={isHeartbeatActive ? heartbeatMultiplier : 1.0}
      />
    </main>
  );
}
