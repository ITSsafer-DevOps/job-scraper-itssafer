import { test } from 'node:test';
import assert from 'node:assert';
import { validateJob, dedupeJobs } from '../src/utils/core.js';

test('validateJob', async (t) => {
    await t.test('should validate complete job', () => {
        const job = {
            jobTitle: 'Test Job',
            companyName: 'Test Company',
            location: 'Bratislava',
            jobId: '12345',
            jobUrl: 'https://test.com/job/12345'
        };
        assert.strictEqual(validateJob(job), true);
    });

    await t.test('should reject invalid job', () => {
        const job = {
            // Missing required fields
            location: 'Bratislava'
        };
        assert.strictEqual(validateJob(job), false);
    });
});

test('dedupeJobs', async (t) => {
    await t.test('should remove duplicates', () => {
        const jobs = [
            { jobId: '1', jobTitle: 'Job 1' },
            { jobId: '1', jobTitle: 'Job 1' },
            { jobId: '2', jobTitle: 'Job 2' }
        ];
        const unique = dedupeJobs(jobs);
        assert.strictEqual(unique.length, 2);
    });
});