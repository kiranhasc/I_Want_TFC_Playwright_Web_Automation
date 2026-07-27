import { useNavigate } from 'react-router-dom';
import type { RunRecord } from '../api/types';
import { StatusBadge } from './StatusBadge';
import { relativeTime, runDuration, formatDuration } from '../utils/runStats';

const ACTIVE_STATUSES = new Set(['queued', 'running']);

export function RunCard({ run }: { run: RunRecord }) {
  const navigate = useNavigate();
  const total = run.stats.passed + run.stats.failed + run.stats.skipped || 1;
  const passPct = Math.round((run.stats.passed / total) * 100);
  const isActive = ACTIVE_STATUSES.has(run.status);

  return (
    <div
      className={`run-card${isActive ? ' is-active' : ''}`}
      onClick={() => navigate(`/runs/${run.runId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/runs/${run.runId}`);
      }}
    >
      <div className="run-card-top">
        <StatusBadge status={run.status} />
        <span className="muted run-card-time">{relativeTime(run.createdAt)}</span>
      </div>
      <div className="run-card-title">
        {run.trigger.project ?? 'All projects'} · {run.trigger.env}
      </div>
      <div className="run-card-sub muted">
        {run.trigger.type === 'rerun' ? `Rerun of ${run.trigger.sourceRunId?.slice(0, 8)}…` : run.trigger.type}
        {run.trigger.grep ? ` · ${run.trigger.grep}` : ''}
      </div>
      <div className="run-card-bar">
        <div className="run-card-bar-fill" style={{ width: `${passPct}%` }} />
      </div>
      <div className="run-card-stats tabular-nums muted">
        <span className="stat-pass">{run.stats.passed}✓</span>
        <span className="stat-fail">{run.stats.failed}✕</span>
        <span className="stat-skip">{run.stats.skipped}–</span>
        <span className="run-card-duration">{formatDuration(runDuration(run))}</span>
      </div>
    </div>
  );
}
