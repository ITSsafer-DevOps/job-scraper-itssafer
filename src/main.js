import { ProfesiaAdapter } from './adapters/ProfesiaAdapter.js';
import { exportJobs } from './exports/exportJobs.js';
import { validateJob, dedupeJobs, logEvent, summaryReport } from './utils/core.js';
import dotenv from 'dotenv';
dotenv.config();

const START_URL = process.env.START_URL;
const CONCURRENCY = Number(process.env.CONCURRENCY) || 3;
const MAX_PAGES = Number(process.env.MAX_PAGES) || 10;
const DELAY_MIN = Number(process.env.DELAY_MIN) || 1000;
const DELAY_MAX = Number(process.env.DELAY_MAX) || 3000;

async function run() {
    logEvent('Crawler started', { START_URL, CONCURRENCY, MAX_PAGES });
    const adapter = new ProfesiaAdapter({
        startUrl: START_URL,
        concurrency: CONCURRENCY,
        maxPages: MAX_PAGES,
        delayMin: DELAY_MIN,
        delayMax: DELAY_MAX,
    });
    const jobs = await adapter.crawl();
    const validJobs = jobs.filter(validateJob);
    const uniqueJobs = dedupeJobs(validJobs);
    await exportJobs(uniqueJobs);
    summaryReport(uniqueJobs);
    logEvent('Crawler finished', { count: uniqueJobs.length });
}

run().catch(e => {
    logEvent('Fatal error', { error: e });
    process.exit(1);
});
