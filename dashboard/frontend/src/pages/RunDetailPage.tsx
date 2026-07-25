import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { RunRecord } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';
import { RunSummaryCharts } from '../components/RunSummaryCharts';
import { TestTable } from '../components/TestTable';

const ACTIVE_STATUSES = new Set(['queued', 'running']);

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const [run, setRun] = useState<RunRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const refetch = useCallback(() => {
    if (!runId) return;
    api.getRun(runId).then(setRun).catch(() => {});
  }, [runId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useDashboardSocket((msg) => {
    if (!runId) return;
    if ('runId' in msg && msg.runId === runId) refetch();
  });

  if (!run) return <p className="muted">Loading run…</p>;

  const isActive = ACTIVE_STATUSES.has(run.status);
  const tests = Object.values(run.tests);
  const total = run.stats.total || tests.length || 1;
  const progressPct = Math.round(((run.stats.passed + run.stats.failed + run.stats.skipped) / total) * 100);

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
    <div className="run-detail">
      <div className="run-detail-header card">
        <div>
          <Link to="/" className="muted">
            ← All runs
          </Link>
          <h2>
            {run.trigger.project ?? 'All projects'} · {run.trigger.env}
          </h2>
          <StatusBadge status={run.status} />
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
