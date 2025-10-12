import fs from 'fs';

export function validateJob(job) {
    // Validácia povinných polí
    return job && job.jobTitle && job.companyName && job.location && job.jobId && job.jobUrl;
}

export function dedupeJobs(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
        const key = job.jobId || job.jobUrl;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export function logEvent(message, data) {
    console.log(`[LOG] ${message}`, data || '');
}

export function summaryReport(jobs) {
    logEvent('Summary report', {
        total: jobs.length,
        topLocations: countBy(jobs, 'location'),
        topSkills: countTags(jobs),
    });
}

function countBy(jobs, field) {
    const stats = {};
    for (const job of jobs) {
        stats[job[field]] = (stats[job[field]] || 0) + 1;
    }
    return stats;
}

function countTags(jobs) {
    const tags = {};
    for (const job of jobs) {
        if (Array.isArray(job.tags)) {
            for (const tag of job.tags) {
                tags[tag] = (tags[tag] || 0) + 1;
            }
        }
    }
    return tags;
}

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
