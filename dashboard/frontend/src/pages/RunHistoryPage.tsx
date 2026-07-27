import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { ProjectsManifest, RunRecord, RunStatus } from '../api/types';
import { NewRunForm } from '../components/NewRunForm';
import { RunCard } from '../components/RunCard';

const STATUS_FILTERS = ['all', 'running', 'passed', 'failed', 'stopped'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function matchesStatus(status: RunStatus, filter: StatusFilter) {
  if (filter === 'all') return true;
  if (filter === 'running') return status === 'running' || status === 'queued';
  return status === filter;
}

export function RunHistoryPage() {
  const [manifest, setManifest] = useState<ProjectsManifest | null>(null);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [starting, setStarting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  const refetchRuns = useCallback(() => {
    api.listRuns(50).then(setRuns).catch(() => {});
  }, []);

  useEffect(() => {
    api.getProjects().then(setManifest).catch(() => {});
    refetchRuns();
  }, [refetchRuns]);

  useDashboardSocket((msg) => {
    if (msg.type === 'snapshot') setRuns(msg.runs);
    else if (msg.type === 'run-status' || msg.type === 'job-status') refetchRuns();
  });

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const filtered = useMemo(() => {
    return runs.filter((r) => {
      if (!matchesStatus(r.status, statusFilter)) return false;
      if (search) {
        const haystack = `${r.trigger.project ?? 'all projects'} ${r.trigger.env} ${r.trigger.grep ?? ''} ${r.trigger.type}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [runs, search, statusFilter]);

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
    <div className="run-history page-fade">
      <div className="page-heading">
        <h2>Run history</h2>
        <p className="muted">Start a new run, or dig back through past ones.</p>
      </div>

      {manifest && <NewRunForm manifest={manifest} onStart={handleStart} starting={starting} />}

      <div className="card run-list">
        <div className="table-toolbar">
          <h3>All runs</h3>
          <input
            ref={searchRef}
            type="search"
            placeholder="Search runs… ( / )"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="table-search"
          />
          <div className="filter-pills" role="tablist" aria-label="Filter by status">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-pill${statusFilter === f ? ' active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {runs.length === 0 ? (
          <p className="muted">No runs yet — start one above.</p>
        ) : filtered.length === 0 ? (
          <p className="muted">No runs match this filter.</p>
        ) : (
          <div className="run-card-grid">
            {filtered.map((run) => (
              <RunCard run={run} key={run.runId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
