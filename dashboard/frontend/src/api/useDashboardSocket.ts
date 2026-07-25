import { useEffect, useRef } from 'react';
import type { RunRecord } from './types';

export type SocketMessage =
  | { type: 'snapshot'; runs: RunRecord[] }
  | { type: 'run-status'; runId: string; status: string }
  | { type: 'job-status'; runId: string; jobId: string; status: string }
  | { type: 'run-event'; runId: string; jobId: string; event: string; payload: unknown };

/**
 * Subscribes to the dashboard backend's live WebSocket feed. Callers treat
 * every message as an "invalidate and refetch" signal for the run(s) they
 * care about, rather than hand-merging deltas client-side — the backend's
 * dashboard/data/runs/<runId>.json is the single source of truth, so we just
 * re-GET it, avoiding a second copy of the stats-recomputation logic drifting
 * out of sync.
 */
export function useDashboardSocket(onMessage: (msg: SocketMessage) => void) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    socket.onmessage = (event) => {
      try {
        onMessageRef.current(JSON.parse(event.data));
      } catch {
        // Ignore malformed frames.
      }
    };
    return () => socket.close();
  }, []);
}
