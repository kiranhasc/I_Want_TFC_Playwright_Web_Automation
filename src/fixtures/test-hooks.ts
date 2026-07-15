import { test as base, expect } from '@playwright/test';
import { logger } from '../utils/logger';

export const test = base;
export { expect };

const truncateTitle = (title: string, limit = 70): string => {
    if (title.length <= limit) {
        return title;
    }

    const visibleLength = Math.floor(limit * 0.7);

    return `${title.substring(0, visibleLength)}...`;
};


test.beforeEach(async ({ }, testInfo) => {

    const testName = truncateTitle(testInfo.title);

    const retryText =
        testInfo.retry > 0
            ? ` (Retry ${testInfo.retry})`
            : '';

    logger.start(
        `============= Test Started: ${testName}${retryText} =============`
    );

});


test.afterEach(async ({ }, testInfo) => {

    const testName = truncateTitle(testInfo.title);

    const status =
        testInfo.status === 'passed'
            ? 'PASSED'
            : 'FAILED';


    const retryText =
        testInfo.retry > 0
            ? ` (Retry ${testInfo.retry})`
            : '';


    const message =
        `============= Test Finished: ${testName}${retryText} - ${status} =============`;


    if (status === 'PASSED') {
        logger.success(message);
    } else {
        logger.failure(message);
    }

});