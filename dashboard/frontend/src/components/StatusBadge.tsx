import './StatusBadge.css';

const STATUS_META: Record<string, { label: string; icon: string; color: string }> = {
  passed: { label: 'Passed', icon: '✓', color: 'var(--status-good)' },
  failed: { label: 'Failed', icon: '✕', color: 'var(--status-critical)' },
  timedOut: { label: 'Timed out', icon: '✕', color: 'var(--status-critical)' },
  interrupted: { label: 'Interrupted', icon: '!', color: 'var(--status-serious)' },
  skipped: { label: 'Skipped', icon: '–', color: 'var(--status-skipped)' },
  running: { label: 'Running', icon: '●', color: 'var(--status-running)' },
  queued: { label: 'Queued', icon: '…', color: 'var(--text-muted)' },
  stopped: { label: 'Stopped', icon: '■', color: 'var(--status-warning)' },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, icon: '?', color: 'var(--text-muted)' };
  return (
    <span className="status-badge" style={{ color: meta.color, borderColor: meta.color }}>
      <span aria-hidden="true">{meta.icon}</span>
      {meta.label}
    </span>
  );
}
