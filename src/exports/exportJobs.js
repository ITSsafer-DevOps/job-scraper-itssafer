import fs from 'fs';
import path from 'path';

export async function exportJobs(jobs) {
    const outputDir = path.resolve('output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    // Export JSON
    fs.writeFileSync(path.join(outputDir, 'jobs.json'), JSON.stringify(jobs, null, 2));
    // Export CSV
    fs.writeFileSync(path.join(outputDir, 'jobs.csv'), jobsToCsv(jobs));
}

function jobsToCsv(jobs) {
    const header = [
        'jobTitle','companyName','location','salaryMin','salaryMax','salaryCurrency','salaryPeriod',
        'employmentType','seniority','tags','postedAt','jobId','jobUrl','companyUrl','description'
    ];
    const rows = jobs.map(job => [
        job.jobTitle,
        job.companyName,
        job.location,
        job.salary?.min ?? '',
        job.salary?.max ?? '',
        job.salary?.currency ?? '',
        job.salary?.period ?? '',
        job.employmentType,
        job.seniority,
        Array.isArray(job.tags) ? job.tags.join('|') : '',
        job.postedAt,
        job.jobId,
        job.jobUrl,
        job.companyUrl,
        job.description?.replace(/\n/g, ' ').replace(/,/g, ' ')
    ].map(v => v === undefined ? '' : v));
    return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
}
