export type TestStatus = 'running' | 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted';
export type RunStatus = 'queued' | 'running' | 'passed' | 'failed' | 'stopped';
export type JobStatus = 'queued' | 'running' | 'passed' | 'failed' | 'stopped';

export interface TestAttachment {
  name: string;
  contentType: string;
  path: string | null;
}

export interface TestError {
  message: string;
  stack?: string;
}

export interface TestRecord {
  testId: string;
  title: string;
  titlePath: string[];
  project: string | null;
  file: string;
  line: number;
  retry: number;
  status: TestStatus;
  duration: number | null;
  error: TestError | null;
  attachments: TestAttachment[];
}

export interface JobRecord {
  jobId: string;
  project: string | null;
  pid: number | null;
  status: JobStatus;
  startedAt: string;
  finishedAt: string | null;
}

export interface RunTrigger {
  type: 'manual' | 'rerun' | 'last-failed';
  env: string;
  project: string | null;
  grep: string | null;
  sourceRunId: string | null;
  scope?: string;
  target?: string | null;
}

export interface RunStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  running: number;
}

export interface RunRecord {
  runId: string;
  createdAt: string;
  trigger: RunTrigger;
  jobs: JobRecord[];
  status: RunStatus;
  stats: RunStats;
  tests: Record<string, TestRecord>;
}

export interface ProjectsManifest {
  environments: { value: string; label: string }[];
  projects: { name: string; label: string; specs: string[] }[];
  tags: { value: string; label: string }[];
}

export type RerunScope = 'test' | 'file' | 'project' | 'all-failed';
