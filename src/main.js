import { ProfesiaAdapter } from './adapters/ProfesiaAdapter.js';
import { exportJobs } from './exports/exportJobs.js';
import { validateJob, dedupeJobs, logEvent, summaryReport } from './utils/core.js';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_CONFIG = {
    START_URL: process.env.START_URL || 'https://www.profesia.sk/praca/',
    CONCURRENCY: Number(process.env.CONCURRENCY) || 3,
    MAX_PAGES: Number(process.env.MAX_PAGES) || 10,
    DELAY_MIN: Number(process.env.DELAY_MIN) || 1000,
    DELAY_MAX: Number(process.env.DELAY_MAX) || 3000
};

export async function startCrawler(config = {}) {
    const finalConfig = {
        ...DEFAULT_CONFIG,
        ...config
    };

    logEvent('Crawler started', { 
        startUrl: finalConfig.START_URL, 
        concurrency: finalConfig.CONCURRENCY, 
        maxPages: finalConfig.MAX_PAGES 
    });

    const adapter = new ProfesiaAdapter({
        startUrl: finalConfig.START_URL,
        concurrency: finalConfig.CONCURRENCY,
        maxPages: finalConfig.MAX_PAGES,
        delayMin: finalConfig.DELAY_MIN,
        delayMax: finalConfig.DELAY_MAX,
    });

    const jobs = await adapter.crawl();
    const validJobs = jobs.filter(validateJob);
    const uniqueJobs = dedupeJobs(validJobs);
    await exportJobs(uniqueJobs);
    summaryReport(uniqueJobs);
    logEvent('Crawler finished', { count: uniqueJobs.length });
    
    return uniqueJobs;
}

// Spustenie z príkazového riadka
if (import.meta.url === `file://${process.argv[1]}`) {
    startCrawler().catch(e => {
        logEvent('Fatal error', { error: e });
        process.exit(1);
    });
}
