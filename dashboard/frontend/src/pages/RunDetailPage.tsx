import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { RunRecord } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';
import { RunSummaryCharts } from '../components/RunSummaryCharts';
import { TestTable } from '../components/TestTable';
import { CopyButton } from '../components/CopyButton';
import { Confetti } from '../components/Confetti';
import { formatDuration, runDuration } from '../utils/runStats';

const ACTIVE_STATUSES = new Set(['queued', 'running']);
const DEFAULT_TITLE = 'TFC Playwright Dashboard';

interface ActivityItem {
  id: string;
  time: string;
  title: string;
  kind: 'begin' | 'pass' | 'fail' | 'skip';
}

function eventKind(status: string): ActivityItem['kind'] {
  if (status === 'passed') return 'pass';
  if (status === 'skipped') return 'skip';
  return 'fail';
}

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const [run, setRun] = useState<RunRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const prevStatusRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const refetch = useCallback(() => {
    if (!runId) return;
    api.getRun(runId).then(setRun).catch(() => {});
  }, [runId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    setActivity([]);
    prevStatusRef.current = null;
  }, [runId]);

  useEffect(() => () => {
    document.title = DEFAULT_TITLE;
  }, []);

  useDashboardSocket((msg) => {
    if (!runId || !('runId' in msg) || msg.runId !== runId) return;
    if (msg.type === 'run-event' && (msg.event === 'test-begin' || msg.event === 'test-end')) {
      const payload = msg.payload as { testId: string; title: string; status?: string };
      const kind: ActivityItem['kind'] = msg.event === 'test-begin' ? 'begin' : eventKind(payload.status ?? 'failed');
      setActivity((prev) =>
        [{ id: `${payload.testId}-${msg.event}-${Date.now()}`, time: new Date().toLocaleTimeString(), title: payload.title, kind }, ...prev].slice(0, 40),
      );
    }
    refetch();
  });

  useEffect(() => {
    if (!run) return;
    const totalKnown = run.stats.total || Object.keys(run.tests).length;
    const icon = run.status === 'passed' ? '✅' : run.status === 'failed' ? '❌' : ACTIVE_STATUSES.has(run.status) ? '●' : run.status === 'stopped' ? '■' : '';
    document.title = `${icon ? `${icon} ` : ''}${run.stats.passed}/${totalKnown} · TFC Dashboard`;
  }, [run]);

  useEffect(() => {
    if (!run) return;
    const prev = prevStatusRef.current;
    if (prev && prev !== run.status && run.status === 'passed' && run.stats.failed === 0 && run.stats.total > 0) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 2600);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = run.status;
  }, [run]);

  if (!run) {
    return (
      <div className="run-detail page-fade">
        <div className="skeleton skeleton-block" style={{ height: 90 }} />
        <div className="skeleton skeleton-block" style={{ height: 200 }} />
      </div>
    );
  }

  const isActive = ACTIVE_STATUSES.has(run.status);
  const tests = Object.values(run.tests);
  const total = run.stats.total || tests.length || 1;
  const progressPct = Math.round(((run.stats.passed + run.stats.failed + run.stats.skipped) / total) * 100);
  const duration = runDuration(run);

  async function handleStop() {
    setBusy(true);
    try {
      await api.stopRun(run!.runId);
      refetch();
    } finally {
      setBusy(false);
    }
  }

  async function handleRerun(scope: 'test' | 'file' | 'project' | 'all-failed', target?: string) {
    setBusy(true);
    try {
      const { runId: newRunId } = await api.rerun(run!.runId, scope, target);
      navigate(`/runs/${newRunId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Rerun failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="run-detail page-fade">
      {celebrate && <Confetti />}

      <div className={`run-detail-header card${run.status === 'failed' ? ' header-alert' : ''}`}>
        <div>
          <Link to="/runs" className="muted">
            ← All runs
          </Link>
          <h2>
            {run.trigger.project ?? 'All projects'} · {run.trigger.env}
          </h2>
          <div className="run-detail-meta">
            <StatusBadge status={run.status} />
            <span className="muted tabular-nums">{formatDuration(duration)}</span>
            <CopyButton value={run.runId} label={`ID ${run.runId.slice(0, 8)}…`} />
          </div>
        </div>
        <div className="run-detail-actions">
          {isActive && (
            <button className="danger-button" onClick={handleStop} disabled={busy}>
              Stop run
            </button>
          )}
          {!isActive && run.stats.failed > 0 && (
            <button className="primary-button" onClick={() => handleRerun('all-failed')} disabled={busy}>
              Rerun all failed
            </button>
          )}
        </div>
      </div>

      {isActive && (
        <div className="card progress-card">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="muted tabular-nums">
            {run.stats.passed + run.stats.failed + run.stats.skipped} / {total} tests · {run.stats.running} running
          </span>
        </div>
      )}

      {isActive && activity.length > 0 && (
        <div className="card activity-feed">
          <h3>Live activity</h3>
          <ul>
            {activity.map((a) => (
              <li key={a.id} className={`activity-item kind-${a.kind}`}>
                <span className="activity-time muted tabular-nums">{a.time}</span>
                <span className="activity-icon">{a.kind === 'begin' ? '▸' : a.kind === 'pass' ? '✓' : a.kind === 'skip' ? '–' : '✕'}</span>
                <span className="activity-title">{a.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RunSummaryCharts stats={run.stats} tests={tests} />

      <TestTable
        tests={tests}
        onRerunTest={(testId) => handleRerun('test', testId)}
        onRerunFile={(file) => handleRerun('file', file)}
        onRerunProject={(project) => handleRerun('project', project)}
      />
    </div>
  );
}
