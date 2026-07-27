import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { TestRecord } from '../api/types';
import { StatusBadge } from './StatusBadge';
import { FailureDetailPanel } from './FailureDetailPanel';

const FAILURE_STATUSES = new Set(['failed', 'timedOut', 'interrupted']);

function formatDuration(ms: number | null) {
  if (ms == null) return '–';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export function TestTable({
  tests,
  onRerunTest,
  onRerunFile,
  onRerunProject,
}: {
  tests: TestRecord[];
  onRerunTest: (testId: string) => void;
  onRerunFile: (file: string) => void;
  onRerunProject: (project: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'failed' | 'passed' | 'skipped'>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

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
    return tests.filter((t) => {
      if (statusFilter === 'failed' && !FAILURE_STATUSES.has(t.status)) return false;
      if (statusFilter === 'passed' && t.status !== 'passed') return false;
      if (statusFilter === 'skipped' && t.status !== 'skipped') return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tests, search, statusFilter]);

  function toggle(testId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(testId)) next.delete(testId);
      else next.add(testId);
      return next;
    });
  }

  return (
    <div className="card">
      <div className="table-toolbar">
        <input
          ref={searchRef}
          type="search"
          placeholder="Search tests… ( / )"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="table-search"
        />
        <div className="filter-pills" role="tablist" aria-label="Filter by status">
          {(['all', 'failed', 'passed', 'skipped'] as const).map((f) => (
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

      <table className="test-table">
        <thead>
          <tr>
            <th />
            <th>Test</th>
            <th>Project</th>
            <th>Status</th>
            <th>Duration</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => {
            const isFailure = FAILURE_STATUSES.has(t.status);
            const isOpen = expanded.has(t.testId);
            return (
              <Fragment key={t.testId}>
                <tr
                  className={isFailure ? 'row-failed' : ''}
                  onClick={() => isFailure && toggle(t.testId)}
                  style={{ cursor: isFailure ? 'pointer' : 'default' }}
                >
                  <td className="expand-cell">{isFailure ? (isOpen ? '▾' : '▸') : ''}</td>
                  <td>
                    <div>{t.title}</div>
                    <div className="muted test-file">{t.file.split(/[\\/]/).pop()}:{t.line}</div>
                  </td>
                  <td className="muted">{t.project ?? '–'}</td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="tabular-nums muted">{formatDuration(t.duration)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      {isFailure && (
                        <button className="link-button" onClick={() => onRerunTest(t.testId)}>
                          Rerun test
                        </button>
                      )}
                      <button className="link-button" onClick={() => onRerunFile(t.file)}>
                        Rerun file
                      </button>
                      {t.project && (
                        <button className="link-button" onClick={() => onRerunProject(t.project!)}>
                          Rerun project
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {isFailure && isOpen && (
                  <tr>
                    <td colSpan={6}>
                      <FailureDetailPanel test={t} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                No tests match this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
