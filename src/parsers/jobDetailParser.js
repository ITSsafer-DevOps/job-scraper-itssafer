import { load } from 'cheerio';

export function parseJobDetail(html, url, now = new Date()) {
    const $ = load(html || '');

    const jobTitle = $('h1[itemprop="title"]').text().trim() || $('h1').first().text().trim() || null;
    const companyName = $('h2[itemprop="hiringOrganization"]').text().trim() || $('a[class*="company"]').text().trim() || null;
    const location = $('span[itemprop="address"]').text().trim() || $('.location').text().trim() || null;
    const employmentType = $('span[itemprop="employmentType"]').text().trim() || null;

    const postedAtRaw = $('span[itemprop="datePosted"]').text().trim() || $('.posted').text().trim() || null;
    const postedAt = parsePostedAt(postedAtRaw, new Date());

    const salaryText = $('[class*="salary"]').text().trim() || $('.salary').text().trim() || ( ($('body').text().match(/\d+\s*(?:EUR|CZK|USD)/i) || [null])[0] ) || '';
    const salary = parseSalary(salaryText);

    const tags = [];
    $('[class*="znalosti"], .details-desc:contains("znalosti"), .tags, .skills').each((i, el) => {
        $(el).find('li, a, span').each((j, it) => {
            const t = $(it).text().trim();
            if (t) tags.push(t);
        });
    });

    const seniority = ($('.details-desc:contains("Prax na pozícii")').first().text().trim() || $('.seniority').first().text().trim()) || null;

    const description = ($('[itemprop="description"]').text() || $('.description').text() || '').replace(/\s+/g, ' ').trim() || null;

    let jobId = null;
    if (url) {
        const m = url.match(/O(\d+)/i) || url.match(/(\d{6,})/);
        jobId = m ? m[1] : url;
    }

    const jobUrl = url || null;
    const companyUrlEl = $('a[href*="firma"], a[class*="company"]').first();
    const companyUrl = companyUrlEl && companyUrlEl.attr('href') ? companyUrlEl.attr('href') : null;

    return {
        jobTitle,
        companyName,
        location,
        salary,
        employmentType,
        seniority,
        tags: tags.length ? Array.from(new Set(tags)) : [],
        postedAt: postedAt || postedAtRaw || null,
        jobId: jobId || null,
        jobUrl,
        companyUrl,
        description,
    };
}

function parseSalary(text) {
    if (!text) return null;
    const t = String(text).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Handle special cases like "dohodou"
    if (/^dohodou$/i.test(t)) {
        return { min: null, max: null, currency: null, period: null };
    }
    
    const reRange = /(?:od\s*)?(\d+[\d\s]*)\s*(?:-|do)\s*(\d+[\d\s]*)\s*(EUR|CZK|USD)?\s*(?:\/?\s*(mesiac|mesačne|rok|hodina|hod))?/i;
    const reSingle = /(\d+[\d\s]*)\s*(EUR|CZK|USD)\s*(?:\/?\s*(mesiac|mesačne|rok|hodina|hod))?/i;
    
    // Normalize period strings
    function normalizePeriod(p) {
        if (!p) return null;
        const map = {
            'mesačne': 'mesiac',
            'hod': 'hodina'
        };
        return map[p] || p;
    }

    let m = t.match(reRange);
    if (m) {
        const min = Number(m[1].replace(/\s+/g, ''));
        const max = Number(m[2].replace(/\s+/g, ''));
        return { min, max, currency: m[3] || null, period: normalizePeriod(m[4]) };
    }
    m = t.match(reSingle);
    if (m) {
        const val = Number(m[1].replace(/\s+/g, ''));
        return { min: val, max: null, currency: m[2] || null, period: normalizePeriod(m[3]) };
    }
    return null;
}

function parsePostedAt(text, now = new Date()) {
    if (!text) return null;
    const txt = String(text).trim();
    
    // Pred X dňami/dňom
    const daysMatch = txt.match(/pred\s+(\d+)\s*(d|dni|dňami|dňom)/i);
    if (daysMatch) {
        const daysAgo = Number(daysMatch[1]);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    }
    
    // Pred X hodinami
    const hoursMatch = txt.match(/pred\s+(\d+)\s*(h|hod|hodinou|hodinami)/i);
    if (hoursMatch) {
        return now.toISOString().split('T')[0];
    }
    
    // Skúsime parsovať ako ISO dátum
    const iso = new Date(txt);
    if (!isNaN(iso.getTime())) {
        return iso.toISOString().split('T')[0];
    }
    
    return null;
}
