import type { ProjectsManifest, RerunScope, RunRecord } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getProjects: () => request<ProjectsManifest>('/api/projects'),

  listRuns: (limit = 20) => request<RunRecord[]>(`/api/runs?limit=${limit}`),

  getRun: (runId: string) => request<RunRecord>(`/api/runs/${runId}`),

  startRun: (body: { env: string; project?: string; grep?: string }) =>
    request<{ runId: string }>('/api/runs', { method: 'POST', body: JSON.stringify(body) }),

  stopRun: (runId: string) => request<{ ok: true }>(`/api/runs/${runId}/stop`, { method: 'POST' }),

  rerun: (runId: string, scope: RerunScope, target?: string) =>
    request<{ runId: string }>(`/api/runs/${runId}/rerun`, {
      method: 'POST',
      body: JSON.stringify({ scope, target }),
    }),

  rerunLastFailed: (env: string, project?: string) =>
    request<{ runId: string }>('/api/runs/last-failed/rerun', {
      method: 'POST',
      body: JSON.stringify({ env, project }),
    }),

  screenshotUrl: (path: string) => `/api/files/screenshot?path=${encodeURIComponent(path)}`,
  videoUrl: (path: string) => `/api/files/video?path=${encodeURIComponent(path)}`,
  traceViewerUrl: (path: string) => {
    const traceFileUrl = `${window.location.origin}/api/files/trace?path=${encodeURIComponent(path)}`;
    return `https://trace.playwright.dev/?trace=${encodeURIComponent(traceFileUrl)}`;
  },
};
