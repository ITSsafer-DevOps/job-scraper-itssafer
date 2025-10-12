

import { sleep, logEvent } from '../utils/core.js';
import { parseJobDetail } from '../parsers/jobDetailParser.js';
import { PuppeteerCrawler } from 'crawlee';

export class ProfesiaAdapter {
    constructor({ startUrl, concurrency, maxPages, delayMin, delayMax }) {
        this.startUrl = startUrl;
        this.concurrency = concurrency;
        this.maxPages = maxPages;
        this.delayMin = delayMin;
        this.delayMax = delayMax;
    }

    async crawl() {
        logEvent('ProfesiaAdapter: crawl started', { startUrl: this.startUrl });
        // Check robots.txt before crawling
        const ok = await this.checkRobots();
        if (!ok) {
            logEvent('ProfesiaAdapter: robots.txt disallows crawling this path - aborting');
            return [];
        }
        const jobs = [];
        let pageCount = 0;
        const crawler = new PuppeteerCrawler({
            maxConcurrency: this.concurrency,
            requestHandlerTimeoutSecs: 60,
            // let Crawlee retry failed requests a few times
            maxRequestRetries: 3,
            async requestHandler({ request, page, enqueueLinks, log }) {
                if (request.label === 'DETAIL') {
                    logEvent('Processing job detail', { url: request.url });
                    const html = await page.content();
                    const job = parseJobDetail(html, request.url);
                    if (job) jobs.push(job);
                    await sleep(randomDelay(this.delayMin, this.delayMax));
                    return;
                }
                if (pageCount >= this.maxPages) return;
                pageCount++;
                logEvent('Processing listing page', { url: request.url });
                // Robustnejší selektor pre detailné odkazy
                const detailLinks = await page.$$eval('a[href^="/praca/"][href*="O"][href*="?search_id="]', els => els.map(e => e.href));
                logEvent('Enqueued job detail links', { count: detailLinks.length });
                for (const link of detailLinks) {
                    await crawler.addRequests([{ url: link, label: 'DETAIL' }]);
                }
                await sleep(randomDelay(this.delayMin, this.delayMax));
            },
            failedRequestHandler({ request }) {
                logEvent('Failed request', { url: request.url });
            },
        });
        await crawler.run([this.startUrl]);
        logEvent('ProfesiaAdapter: crawl finished', { jobs: jobs.length });
        return jobs;
    }

    async checkRobots() {
        try {
            if (!this.startUrl) return true;
            const u = new URL(this.startUrl);
            const robotsUrl = `${u.origin}/robots.txt`;
            logEvent('Checking robots.txt', { robotsUrl });
            const res = await fetch(robotsUrl, { redirect: 'follow' });
            if (!res.ok) {
                logEvent('robots.txt not found or unreachable, proceeding');
                return true;
            }
            const txt = await res.text();
            // simple parser: look for User-agent: * rules and Disallow entries
            const lines = txt.split(/\r?\n/).map(l => l.trim());
            let applies = false;
            const disallows = [];
            for (const line of lines) {
                if (!line) continue;
                const la = line.split(':');
                if (la.length < 2) continue;
                const key = la[0].trim().toLowerCase();
                const value = la.slice(1).join(':').trim();
                if (key === 'user-agent' && (value === '*' || value.toLowerCase().includes('apify') || value.toLowerCase().includes('crawlee'))) {
                    applies = true;
                    continue;
                }
                if (applies && key === 'disallow') {
                    disallows.push(value || '/');
                }
                // stop applying on next user-agent
                if (key === 'user-agent' && value !== '*' ) {
                    applies = false;
                }
            }
            const path = u.pathname || '/';
            for (const d of disallows) {
                if (!d) continue;
                // if disallow is '/', then everything disallowed
                if (d === '/') return false;
                if (path.startsWith(d)) return false;
            }
            return true;
        } catch (e) {
            logEvent('robots.txt check failed, proceeding by default', { error: String(e) });
            return true;
        }
    }
}


function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
