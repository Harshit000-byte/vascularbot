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

const shortId = (id: string) => id.replace(/^(node_|cor_|hep_|cc_)/, '').replaceAll('_', ' ');

function describeStep(step: DijkstraStep | undefined, previousStep: DijkstraStep | undefined) {
  if (!step) {
    return {
      title: 'Ready to explore the graph',
      detail: 'Start at the source with distance 0. Every other node begins at infinity.',
      outcome: 'Select Next to extract the lowest-cost node from the priority queue.'
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
  const oldDistance = previousStep?.distances[target] ?? Infinity;
  const candidate = step.distances[source] + cost;
  const isImproved = step.previous[target] === source;

  return {
    title: `Relax edge ${shortId(source)} → ${shortId(target)}`,
    detail: `${formatDistance(step.distances[source])} + ${cost.toFixed(1)} = ${candidate.toFixed(1)}${Number.isFinite(oldDistance) ? ` (previously ${oldDistance.toFixed(1)})` : ''}`,
    outcome: isImproved
      ? `Better route found. Set dist(${shortId(target)}) = ${candidate.toFixed(1)} and remember ${shortId(source)} as its predecessor.`
      : 'The existing route is already cheaper, so keep the current distance.'
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
  const safeIndex = Math.max(-1, Math.min(stepIndex, steps.length - 1));
  const step = safeIndex >= 0 ? steps[safeIndex] : undefined;
  const previousStep = safeIndex > 0 ? steps[safeIndex - 1] : undefined;
  const description = describeStep(step, previousStep);
  const distances = step?.distances ?? Object.fromEntries(nodes.map(node => [node.id, node.id === startNodeId ? 0 : Infinity]));
  const visited = new Set(step?.visitedNodes ?? []);
  const queue = Object.entries(distances)
    .filter(([id, distance]) => !visited.has(id) && Number.isFinite(distance))
    .sort((a, b) => a[1] - b[1]);
  const currentLine = step?.evaluatedEdge ? 5 : 3;
  const progress = steps.length ? ((safeIndex + 1) / steps.length) * 100 : 0;

  const jumpTo = (index: number) => onStepChange(Math.max(-1, Math.min(index, steps.length - 1)));

  return (
    <section className="tutor-panel" aria-label="Dijkstra step-by-step lesson">
      <div className="tutor-heading">
        <div className="tutor-title-group">
          <span className="section-kicker"><Sparkles size={13} /> LEARN BY DOING</span>
          <h2>Inside Dijkstra&apos;s algorithm</h2>
          <p>Watch the greedy search settle nodes and improve tentative distances.</p>
        </div>
        <div className="lesson-badge"><CircleDot size={14} /> STEP-BY-STEP</div>
      </div>

      <div className="lesson-progress" aria-label={`Step ${safeIndex + 1} of ${steps.length}`}>
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
          <div className="step-count">STEP <strong>{String(safeIndex + 1).padStart(2, '0')}</strong><span>/ {String(steps.length).padStart(2, '0')}</span></div>
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
            <button onClick={() => jumpTo(safeIndex + 1)} title="Next step" aria-label="Next step"><ChevronRight size={17} /></button>
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
              <div key={line} className={`pseudo-line ${Number(line) === currentLine ? 'is-active' : ''}`}>
                <span>{line}</span><code>{code}</code>
                {Number(line) === currentLine && <ArrowRight size={13} />}
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
            <div className="queue-empty"><Check size={15} /> Queue empty — search complete</div>
          )}
          <div className="queue-footnote"><span className="min-dot" /> Next node to settle</div>
        </article>
      </div>

      <div className="algorithm-principle">
        <div className="principle-icon">∑</div>
        <div><strong>The key idea</strong><span>Always expand the nearest unsettled node. Non-negative edge weights guarantee that a settled distance is optimal.</span></div>
        <div className="formula-chip">d(v) = min(d(v), d(u) + w)</div>
      </div>

      <div className="tutor-footnote"><span>WEIGHTED GRAPH</span><ArrowRight size={12} /> Vessel costs include radius, blood-flow direction and velocity. The same algorithm works with any non-negative weights.</div>
    </section>
  );
}
