import { api } from '../api/client';
import type { TestRecord } from '../api/types';

function attachmentsByName(test: TestRecord, name: string) {
  return test.attachments.filter((a) => a.name === name && a.path);
}

export function FailureDetailPanel({ test }: { test: TestRecord }) {
  const screenshots = attachmentsByName(test, 'screenshot');
  const videos = attachmentsByName(test, 'video');
  const traces = attachmentsByName(test, 'trace');

  return (
    <div className="failure-panel">
      {test.error && (
        <div className="failure-error">
          <div className="failure-error-message">{test.error.message}</div>
          {test.error.stack && <pre className="failure-error-stack">{test.error.stack}</pre>}
        </div>
      )}

      <div className="failure-artifacts">
        {screenshots.map((s) => (
          <a key={s.path} href={api.screenshotUrl(s.path!)} target="_blank" rel="noreferrer" className="artifact-thumb">
            <img src={api.screenshotUrl(s.path!)} alt={`Screenshot for ${test.title}`} />
          </a>
        ))}
        {videos.map((v) => (
          <video key={v.path} src={api.videoUrl(v.path!)} controls className="artifact-video" />
        ))}
        {traces.map((t) => (
          <a key={t.path} href={api.traceViewerUrl(t.path!)} target="_blank" rel="noreferrer" className="trace-link">
            Open trace ↗
          </a>
        ))}
        {screenshots.length === 0 && videos.length === 0 && traces.length === 0 && (
          <span className="muted">No attachments captured for this test.</span>
        )}
      </div>
    </div>
  );
}
