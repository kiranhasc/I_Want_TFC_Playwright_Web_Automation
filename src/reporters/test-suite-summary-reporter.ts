import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

class TestSuiteSummaryReporter implements Reporter {
  private totalTestCases = 0;
  private discoveredTestIds = new Set<string>();
  private startedTestIds = new Set<string>();
  private latestResults = new Map<string, TestResult>();

  onBegin(_config: FullConfig, suite: Suite): void {
    const discoveredTests = suite.allTests();
    this.totalTestCases = discoveredTests.length;
    this.discoveredTestIds = new Set(discoveredTests.map((test) => test.id));
    this.startedTestIds.clear();
    this.latestResults.clear();

    console.log('\n# ========================================');
    console.log('TEST SUITE EXECUTION STARTED');
    console.log(`# Total Test Cases : ${this.totalTestCases}`);
    console.log('# ========================================\n');
  }

  onTestBegin(test: TestCase): void {
    if (this.startedTestIds.has(test.id)) {
      return;
    }

    this.startedTestIds.add(test.id);
    console.log(`TEST CASE EXECUTION PROGRESS : ${this.startedTestIds.size} of ${this.totalTestCases}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.latestResults.set(test.id, result);
  }

  onEnd(_result: FullResult): void {
    let passedTestCases = 0;
    let failedTestCases = 0;
    let skippedTestCases = 0;

    for (const testId of this.discoveredTestIds) {
      if (!this.startedTestIds.has(testId)) {
        skippedTestCases += 1;
        continue;
      }

      const result = this.latestResults.get(testId);
      if (result?.status === 'passed') {
        passedTestCases += 1;
      } else if (result?.status === 'skipped') {
        skippedTestCases += 1;
      } else {
        failedTestCases += 1;
      }
    }

    console.log('\n# ========================================');
    console.log('TEST SUITE EXECUTION SUMMARY');
    console.log('');
    console.log(`# Total Test Cases : ${this.totalTestCases}`);
    console.log(`Test Cases Executed : ${this.startedTestIds.size}`);
    console.log(`Test Cases Passed : ${passedTestCases}`);
    console.log(`Test Cases Failed : ${failedTestCases}`);
    console.log(`Test Cases Skipped : ${skippedTestCases}`);
    console.log('# ========================================\n');
  }

  printsToStdio(): boolean {
    return false;
  }
}

export default TestSuiteSummaryReporter;