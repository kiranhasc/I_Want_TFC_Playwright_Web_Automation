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

/** What kind of problem the failure is. Only 'code' can have a spot fix. */
export type FailureCategory = 'code' | 'environment' | 'infrastructure' | 'unknown';

export interface RcaResult {
  ruleId?: string;
  source: 'heuristic' | 'ollama' | 'api';
  category: FailureCategory;
  model?: string;
  summary: string;
  rootCause: string;
  suggestedFix: string;
  note?: string;
  generatedAt: string;
  errorContextFile: string | null;
}

export interface DiffRow {
  type: 'context' | 'add' | 'remove';
  text: string;
}

/** A change that would make the test pass without fixing the cause. */
export interface SpotFixRisk {
  id: string;
  label: string;
  detail: string;
}

export interface SpotFixEdit {
  file: string;
  absolutePath: string;
  oldCode: string;
  newCode: string;
  reason: string;
  diff: DiffRow[];
  risks: SpotFixRisk[];
}

export interface SpotFixApplied {
  appliedAt: string;
  files: { file: string; absolutePath: string }[];
  /** Id in the server-side applied-fix registry; used to revert from anywhere. */
  registryId?: string;
}

/**
 * A spot fix currently sitting in the working tree. Tracked independently of
 * runs so it stays revertable after "Apply & rerun" moves you to a new run.
 */
export interface AppliedSpotFix {
  id: string;
  runId: string;
  testId: string;
  testTitle: string;
  appliedAt: string;
  files: string[];
}

/**
 * Outcome of a provisional apply. 'pending' while the verification rerun is in
 * flight; 'failed' means the fix did not turn the test green and was rolled
 * back automatically.
 */
export interface SpotFixVerification {
  status: 'pending' | 'passed' | 'failed';
  rerunRunId?: string;
  detail?: string;
  checkedAt?: string;
}

export interface SpotFixReverted {
  revertedAt: string;
  reverted: string[];
  skipped: string[];
}

/**
 * A proposed source edit awaiting human approval. `available: false` means no
 * fix is being offered — `reason` says why (not a code issue, no AI provider,
 * nothing verifiable), and is the normal case rather than an error.
 */
export interface SpotFixProposal {
  available: boolean;
  reason?: string;
  proposalId?: string;
  explanation?: string;
  confidence?: 'high' | 'medium' | 'low';
  model?: string;
  provider?: string;
  edits: SpotFixEdit[];
  rejected?: string[];
  generatedAt?: string;
  applied?: SpotFixApplied | null;
  reverted?: SpotFixReverted | null;
  verification?: SpotFixVerification | null;
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
  rca?: RcaResult | null;
  spotFix?: SpotFixProposal | null;
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
  /**
   * Set when a still-'running' run has stopped emitting reporter events for
   * longer than the stall threshold — i.e. it is wedged and will not recover.
   * Cleared if events resume.
   */
  stalledSince?: string | null;
}

export interface ProjectsManifest {
  environments: { value: string; label: string }[];
  projects: { name: string; label: string; specs: string[] }[];
  tags: { value: string; label: string }[];
}

export type RerunScope = 'test' | 'file' | 'project' | 'all-failed';

export type AutoUpdatePhase =
  | 'idle'
  | 'checking'
  | 'pulling'
  | 'installing'
  | 'building'
  | 'syncing-manifest'
  | 'updated'
  | 'up-to-date'
  | 'skipped'
  | 'error';

export interface AutoUpdateStatus {
  phase: AutoUpdatePhase;
  sha: string | null;
  shortSha: string | null;
  branch: string | null;
  detail: string | null;
  changedFiles: string[];
  lastCheckedAt: string | null;
  lastUpdatedAt: string | null;
}
