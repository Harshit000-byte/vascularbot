'use client';

import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Pause,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DijkstraResult, DijkstraStep, VascularNode } from '../types/vascular';

interface DijkstraTutorProps {
  result: DijkstraResult;
  nodes: VascularNode[];
  startNodeId: string;
  stepIndex: number;
  isPlaying: boolean;
  onStepChange: (index: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
}

const formatDistance = (distance: number | undefined) =>
  distance === undefined || !Number.isFinite(distance) ? '∞' : distance.toFixed(1);

const shortId = (id: string) => id.replace(/^(node_|cor_|hep_|cc_|teach_)/, '').replaceAll('_', ' ');

function describeStep(
  step: DijkstraStep | undefined,
  previousStep: DijkstraStep | undefined,
  path: string[],
  totalCost: number
) {
  if (!step) {
    return {
      title: 'Ready to explore the graph',
      detail: 'Start at the source with distance 0. Every other node begins at infinity.',
      outcome: 'Select Next to extract the lowest-cost node from the priority queue.'
    };
  }

  if (step.phase === 'complete') {
    return {
      title: path.length ? 'Destination settled — shortest route found' : 'No route reaches the destination',
      detail: path.length
        ? `${path.map(shortId).join(' → ')} (total cost: ${totalCost.toFixed(1)})`
        : 'The destination stayed at infinity, so it is unreachable from this source.',
      outcome: path.length
        ? 'Trace the remembered predecessor links backward from the destination. Because its distance was settled, this route is optimal.'
        : 'The queue ran out of reachable nodes before the destination could be settled.'
    };
  }

  if (!step.evaluatedEdge) {
    return {
      title: `${shortId(step.currentNodeId)} is now settled`,
      detail: `It has the smallest tentative distance (${formatDistance(step.distances[step.currentNodeId])}), so this value is final.`,
      outcome: 'Dijkstra is greedy: once the minimum node is removed from the queue, it never needs to be revisited.'
    };
  }

  const { source, target, cost } = step.evaluatedEdge;
  const oldDistance = step.evaluatedEdge.previousDistance ?? previousStep?.distances[target] ?? Infinity;
  const candidate = step.evaluatedEdge.candidateDistance ?? step.distances[source] + cost;
  const isImproved = step.evaluatedEdge.wasUpdated ?? step.previous[target] === source;

  return {
    title: `Check neighbor ${shortId(target)} from ${shortId(source)}`,
    detail: `Candidate: ${formatDistance(step.distances[source])} + ${cost.toFixed(1)} = ${candidate.toFixed(1)}. Current best: ${formatDistance(oldDistance)}.`,
    outcome: isImproved
      ? `${candidate.toFixed(1)} is smaller, so update dist(${shortId(target)}) and set its predecessor to ${shortId(source)}.`
      : `${formatDistance(oldDistance)} is already smaller (or equal), so keep the existing distance and predecessor.`
  };
}

export function DijkstraTutor({
  result,
  nodes,
  startNodeId,
  stepIndex,
  isPlaying,
  onStepChange,
  onTogglePlay,
  onReset
}: DijkstraTutorProps) {
  const steps = result.steps;
  const isClassroomExample = nodes.some(node => node.id.startsWith('teach_'));
  const safeIndex = Math.max(-1, Math.min(stepIndex, steps.length - 1));
  const step = safeIndex >= 0 ? steps[safeIndex] : undefined;
  const previousStep = safeIndex > 0 ? steps[safeIndex - 1] : undefined;
  const description = describeStep(step, previousStep, result.path, result.totalCost);
  const distances = step?.distances ?? Object.fromEntries(nodes.map(node => [node.id, node.id === startNodeId ? 0 : Infinity]));
  const visited = new Set(step?.visitedNodes ?? []);
  const queue = Object.entries(distances)
    .filter(([id, distance]) => !visited.has(id) && Number.isFinite(distance))
    .sort((a, b) => a[1] - b[1]);
  const currentLines = !step
    ? [1]
    : step.phase === 'complete'
      ? [7]
      : step.evaluatedEdge
        ? [4, 5, 6]
        : [2, 3];
  const progress = steps.length ? ((safeIndex + 1) / steps.length) * 100 : 0;

  const jumpTo = (index: number) => onStepChange(Math.max(-1, Math.min(index, steps.length - 1)));

  return (
    <section className="tutor-panel" aria-label="Dijkstra step-by-step lesson">
      <div className="tutor-heading">
        <div className="tutor-title-group">
          <span className="section-kicker"><Sparkles size={13} /> LEARN BY DOING</span>
          <h2>Inside Dijkstra&apos;s algorithm</h2>
          <p>{isClassroomExample
            ? 'Start with six nodes and visible edge weights. Use Next to follow every decision, including rejected routes.'
            : 'Use Next to reveal one decision at a time—including when a candidate route is rejected.'}</p>
        </div>
        <div className="lesson-badge"><CircleDot size={14} /> STEP-BY-STEP</div>
      </div>

      <div className="lesson-progress" aria-label={safeIndex < 0 ? `Ready to begin; ${steps.length} lesson steps` : `Step ${safeIndex + 1} of ${steps.length}`}>
        <div className="lesson-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="tutor-grid">
        <motion.article
          className="step-explainer"
          key={`${safeIndex}-${step?.evaluatedEdge?.target ?? 'settled'}`}
          initial={{ opacity: 0.55, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="step-count">{safeIndex < 0 ? 'READY' : 'STEP'} <strong>{safeIndex < 0 ? '▶' : String(safeIndex + 1).padStart(2, '0')}</strong><span>{safeIndex < 0 ? `${steps.length} decisions` : `/ ${String(steps.length).padStart(2, '0')}`}</span></div>
          <h3>{description.title}</h3>
          <p>{description.detail}</p>
          <div className="step-outcome"><Check size={15} /><span>{description.outcome}</span></div>

          <div className="lesson-controls" aria-label="Lesson playback controls">
            <button onClick={() => jumpTo(-1)} title="Back to start" aria-label="Back to start"><ChevronFirst size={17} /></button>
            <button onClick={() => jumpTo(safeIndex - 1)} title="Previous step" aria-label="Previous step"><ChevronLeft size={17} /></button>
            <button className="lesson-play" onClick={onTogglePlay} title={isPlaying ? 'Pause lesson' : 'Play lesson'} aria-label={isPlaying ? 'Pause lesson' : 'Play lesson'}>
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              {isPlaying ? 'Pause' : 'Play lesson'}
            </button>
            <button className="lesson-next" onClick={() => jumpTo(safeIndex + 1)} title="Next step" aria-label="Next step"><ChevronRight size={17} />Next</button>
            <button onClick={() => jumpTo(steps.length - 1)} title="Jump to end" aria-label="Jump to end"><ChevronLast size={17} /></button>
            <button onClick={onReset} title="Restart lesson" aria-label="Restart lesson"><RotateCcw size={15} /></button>
          </div>
        </motion.article>

        <article className="pseudocode-card">
          <div className="card-label"><span className="window-dots"><i /><i /><i /></span> DIJKSTRA / PSEUDOCODE</div>
          <div className="pseudocode-lines">
            {[
              ['1', 'dist[start] ← 0; others ← ∞'],
              ['2', 'while queue is not empty:'],
              ['3', '  u ← extract-min(queue)'],
              ['4', '  for each neighbor v of u:'],
              ['5', '    candidate ← dist[u] + w(u, v)'],
              ['6', '    if candidate < dist[v]: update'],
              ['7', 'reconstruct route from predecessors']
            ].map(([line, code]) => (
              <div key={line} className={`pseudo-line ${currentLines.includes(Number(line)) ? 'is-active' : ''}`}>
                <span>{line}</span><code>{code}</code>
                {Number(line) === currentLines[currentLines.length - 1] && <ArrowRight size={13} />}
              </div>
            ))}
          </div>
        </article>

        <article className="queue-card">
          <div className="card-label"><ArrowDownRight size={14} /> PRIORITY QUEUE <span>lowest first</span></div>
          {queue.length ? (
            <div className="queue-list">
              {queue.slice(0, 5).map(([id, distance], index) => (
                <div className={`queue-item ${index === 0 ? 'queue-min' : ''}`} key={id}>
                  <span className="queue-rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="queue-node">{shortId(id)}</span>
                  <span className="queue-distance">{formatDistance(distance)}</span>
                </div>
              ))}
              {queue.length > 5 && <div className="queue-more">+ {queue.length - 5} more nodes</div>}
            </div>
          ) : (
            <div className="queue-empty"><Check size={15} />
              {step?.phase === 'complete' ? 'Queue empty — search complete' : 'No candidates yet — checking neighbors next'}
            </div>
          )}
          <div className="queue-footnote"><span className="min-dot" />{step?.phase === 'complete' ? 'Destination settled — route is final' : 'Next node to settle'}</div>
        </article>
      </div>

      <div className="algorithm-principle">
        <div className="principle-icon">∑</div>
        <div><strong>The key idea</strong><span>Always expand the nearest unsettled node. Non-negative edge weights guarantee that a settled distance is optimal.</span></div>
        <div className="formula-chip">d(v) = min(d(v), d(u) + w)</div>
      </div>

      <div className="tutor-footnote"><span>{isClassroomExample ? 'CLASSROOM WEIGHTS' : 'WEIGHTED GRAPH'}</span><ArrowRight size={12} />
        {isClassroomExample
          ? 'Edge labels are positive weights. Each step updates the cheapest known distance and predecessor.'
          : 'Vessel costs include radius, blood-flow direction and velocity. The same algorithm works with any non-negative weights.'}
      </div>
    </section>
  );
}
