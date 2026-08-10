import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { RcaResult, SpotFixProposal, SpotFixEdit, TestRecord } from '../api/types';
import { CopyButton } from './CopyButton';

/**
 * Human-approval gate for an AI-proposed source edit.
 *
 * Nothing here writes to disk on its own: generating a proposal is read-only,
 * and the diff is shown so a person decides. The risk warnings matter — a
 * model will sometimes "fix" a test by rewriting what it asserts, which
 * silently destroys the test's value, so those edits are called out rather
 * than left for the reviewer to notice.
 */

function DiffView({ edit }: { edit: SpotFixEdit }) {
  return (
    <div className="spotfix-diff">
      <div className="spotfix-diff-header">
        <code>{edit.file}</code>
        <CopyButton value={edit.newCode} label="Copy new code" />
      </div>
      {edit.reason && <div className="spotfix-edit-reason">{edit.reason}</div>}
      <pre className="spotfix-diff-body">
        {edit.diff.map((row, i) => (
          <div key={i} className={`diff-row diff-${row.type}`}>
            <span className="diff-gutter">{row.type === 'add' ? '+' : row.type === 'remove' ? '-' : ' '}</span>
            <span className="diff-text">{row.text || ' '}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

function riskList(edits: SpotFixEdit[]) {
  // De-duplicate by risk id: the same warning across two edits reads as noise.
  return [...new Map(edits.flatMap((e) => e.risks.map((r) => [r.id, r]))).values()];
}

function RiskWarnings({ edits }: { edits: SpotFixEdit[] }) {
  const risks = riskList(edits);
  if (!risks.length) return null;
  const high = risks.filter((r) => r.severity === 'high');
  const low = risks.filter((r) => r.severity !== 'high');

  return (
    <div className="spotfix-risks">
      {high.length > 0 && (
        <>
          <div className="spotfix-risks-title spotfix-risks-title-high">
            ⛔ This changes what the test checks — cannot apply without confirming below
          </div>
          <ul>
            {high.map((risk) => (
              <li key={risk.id}>
                <strong>{risk.label}.</strong> {risk.detail}
              </li>
            ))}
          </ul>
        </>
      )}
      {low.length > 0 && (
        <>
          <div className="spotfix-risks-title">⚠ Review before applying</div>
          <ul>
            {low.map((risk) => (
              <li key={risk.id}>
                <strong>{risk.label}.</strong> {risk.detail}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function SpotFixPanel({
  test,
  runId,
  rca,
}: {
  test: TestRecord;
  runId: string;
  rca: RcaResult | null | undefined;
}) {
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<SpotFixProposal | null | undefined>(test.spotFix);
  const [busy, setBusy] = useState<'propose' | 'apply' | 'apply-rerun' | 'revert' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  // A spot fix only makes sense for a code-level cause, and the server
  // enforces the same rule — this just avoids offering a button that would
  // always come back declining.
  const isCodeIssue = rca?.category === 'code';

  async function handlePropose() {
    setBusy('propose');
    setError(null);
    setRiskAcknowledged(false);
    try {
      setProposal(await api.proposeSpotFix(runId, test.testId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a spot fix');
    } finally {
      setBusy(null);
    }
  }

  async function handleApply(rerun: boolean, verify = false) {
    setBusy(rerun ? 'apply-rerun' : 'apply');
    setError(null);
    try {
      const result = await api.applySpotFix(runId, test.testId, rerun, verify, riskAcknowledged);
      setProposal((prev) =>
        prev
          ? { ...prev, applied: result.applied, reverted: null, verification: verify ? { status: 'pending' } : null }
          : prev
      );
      // Follow the rerun the same way the other rerun buttons do, so the user
      // lands on the run that will tell them whether the fix actually worked.
      if (result.rerunRunId) navigate(`/runs/${result.rerunRunId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not apply the spot fix');
    } finally {
      setBusy(null);
    }
  }

  async function handleRevert() {
    setBusy('revert');
    setError(null);
    try {
      const result = await api.revertSpotFix(runId, test.testId);
      setProposal((prev) => (prev ? { ...prev, applied: null, reverted: result } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not revert the spot fix');
    } finally {
      setBusy(null);
    }
  }

  if (!rca) return null;

  if (!isCodeIssue) {
    return (
      <div className="spotfix-section">
        <div className="spotfix-unavailable">
          No spot fix offered — this failure is categorised as <strong>{rca.category}</strong>, not a code issue, so
          there is nothing in the repo to change.
        </div>
      </div>
    );
  }

  const applied = proposal?.applied;
  const verification = proposal?.verification;
  const highRisk = proposal?.available ? riskList(proposal.edits).some((r) => r.severity === 'high') : false;

  return (
    <div className="spotfix-section">
      {!proposal && (
        <button className="secondary-button" onClick={handlePropose} disabled={busy !== null}>
          {busy === 'propose' ? 'Generating spot fix…' : 'Propose spot fix'}
        </button>
      )}

      {error && <div className="rca-error">{error}</div>}

      {proposal && !proposal.available && (
        <div className="spotfix-unavailable">
          <div>No spot fix offered — {proposal.reason}</div>
          <button className="link-button" onClick={handlePropose} disabled={busy !== null}>
            {busy === 'propose' ? 'Retrying…' : 'Try again'}
          </button>
        </div>
      )}

      {proposal?.available && (
        <div className="spotfix-result">
          <div className="spotfix-header">
            <span className="spotfix-title">Proposed fix</span>
            <span className={`spotfix-confidence spotfix-confidence-${proposal.confidence}`}>
              {proposal.confidence} confidence
            </span>
            {proposal.model && <span className="muted">{proposal.model}</span>}
          </div>

          {proposal.explanation && <p className="spotfix-explanation">{proposal.explanation}</p>}

          <RiskWarnings edits={proposal.edits} />

          {proposal.edits.map((edit) => (
            <DiffView key={`${edit.file}-${edit.oldCode.slice(0, 40)}`} edit={edit} />
          ))}

          {proposal.rejected && proposal.rejected.length > 0 && (
            <div className="spotfix-rejected">
              Some proposed edits were discarded because they could not be verified against the source:
              <ul>
                {proposal.rejected.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {verification && (
            <div className={`spotfix-verification is-${verification.status}`}>
              {verification.status === 'pending' && '⏳ Rerunning to check this fix — it will be undone automatically unless the test passes.'}
              {verification.status === 'passed' && highRisk &&
                `✓ The rerun passed — but this edit changed what's expected, so that was never in doubt. It does not confirm the fix is correct. ${verification.detail || ''}`}
              {verification.status === 'passed' && !highRisk && `✓ Verified — ${verification.detail}`}
              {verification.status === 'failed' && `✕ Not verified — ${verification.detail}`}
            </div>
          )}

          {applied ? (
            <div className="spotfix-applied">
              <div>
                ✓ Applied to {applied.files.map((f) => f.file).join(', ')}. If the rerun still fails, undo it here or
                from the banner at the top of the page — review in git before committing either way.
              </div>
              <button className="secondary-button" onClick={handleRevert} disabled={busy !== null}>
                {busy === 'revert' ? 'Reverting…' : 'Revert this change'}
              </button>
            </div>
          ) : (
            <div className="spotfix-actions-wrap">
              {highRisk && (
                <label className="spotfix-risk-ack">
                  <input
                    type="checkbox"
                    checked={riskAcknowledged}
                    onChange={(e) => setRiskAcknowledged(e.target.checked)}
                  />
                  I've reviewed this — it changes the test's expectations rather than fixing the app, and I've
                  confirmed that's the right call here, not a bug being hidden.
                </label>
              )}
              <div className="spotfix-actions">
                {/* Default action is the verified one: an AI fix is a guess until
                    a rerun proves it, so keeping it should be the deliberate
                    fallback rather than the easy path. Not a meaningful signal
                    for a high-risk edit though — see the title/tooltip. */}
                <button
                  className="primary-button"
                  onClick={() => handleApply(true, true)}
                  disabled={busy !== null || (highRisk && !riskAcknowledged)}
                  title={
                    highRisk
                      ? 'A passing rerun does not validate this edit — it will pass by construction. Confirm above before applying.'
                      : 'Applies the fix, reruns the test, and undoes the change automatically unless it passes'
                  }
                >
                  {busy === 'apply-rerun' ? 'Applying…' : 'Apply & verify'}
                </button>
                <button
                  className="secondary-button"
                  onClick={() => handleApply(false)}
                  disabled={busy !== null || (highRisk && !riskAcknowledged)}
                >
                  {busy === 'apply' ? 'Applying…' : 'Apply without rerunning'}
                </button>
                <button className="link-button" onClick={handlePropose} disabled={busy !== null}>
                  {busy === 'propose' ? 'Regenerating…' : 'Regenerate'}
                </button>
              </div>
            </div>
          )}

          {proposal.reverted && (
            <div className="spotfix-reverted">
              Reverted {proposal.reverted.reverted.join(', ')}.
              {proposal.reverted.skipped.length > 0 && ` Skipped: ${proposal.reverted.skipped.join('; ')}.`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
