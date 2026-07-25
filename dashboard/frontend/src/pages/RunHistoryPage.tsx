import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { ProjectsManifest, RunRecord } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';
import { NewRunForm } from '../components/NewRunForm';

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function RunHistoryPage() {
  const [manifest, setManifest] = useState<ProjectsManifest | null>(null);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  const refetchRuns = useCallback(() => {
    api.listRuns(30).then(setRuns).catch(() => {});
  }, []);

  useEffect(() => {
    api.getProjects().then(setManifest).catch(() => {});
    refetchRuns();
  }, [refetchRuns]);

  useDashboardSocket((msg) => {
    if (msg.type === 'snapshot') setRuns(msg.runs);
    else if (msg.type === 'run-status' || msg.type === 'job-status') refetchRuns();
  });

  async function handleStart(args: { env: string; project?: string; grep?: string }) {
    setStarting(true);
    try {
      const { runId } = await api.startRun(args);
      navigate(`/runs/${runId}`);
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="run-history">
      {manifest && <NewRunForm manifest={manifest} onStart={handleStart} starting={starting} />}

      <div className="card run-list">
        <h3>Run history</h3>
        {runs.length === 0 ? (
          <p className="muted">No runs yet — start one above.</p>
        ) : (
          <table className="test-table">
            <thead>
              <tr>
                <th>Run</th>
                <th>Status</th>
                <th>Results</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.runId} onClick={() => navigate(`/runs/${run.runId}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div>{run.trigger.project ?? 'All projects'} · {run.trigger.env}</div>
                    <div className="muted test-file">
                      {run.trigger.type === 'rerun' ? `Rerun of ${run.trigger.sourceRunId?.slice(0, 8)}…` : run.trigger.type}
                      {run.trigger.grep ? ` · ${run.trigger.grep}` : ''}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="tabular-nums muted">
                    {run.stats.passed}✓ / {run.stats.failed}✕ / {run.stats.skipped}–
                  </td>
                  <td className="muted">{relativeTime(run.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
