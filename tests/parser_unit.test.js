import { parseJobDetail } from '../src/parsers/jobDetailParser.js';
import assert from 'assert';

// Unit testy pre parseSalary a parsePostedAt
function testParseSalary() {
    const testCases = [
        {
            input: '2000 - 2500 EUR/mesiac',
            expected: { min: 2000, max: 2500, currency: 'EUR', period: 'mesiac' }
        },
        {
            input: 'od 2000 EUR/mesiac',
            expected: { min: 2000, max: null, currency: 'EUR', period: 'mesiac' }
        },
        {
            input: '2000 EUR mesačne',
            expected: { min: 2000, max: null, currency: 'EUR', period: 'mesiac' }
        },
        {
            input: '2000-3000 EUR',
            expected: { min: 2000, max: 3000, currency: 'EUR', period: null }
        },
        {
            input: 'dohodou',
            expected: { min: null, max: null, currency: null, period: null }
        }
    ];

    for (const tc of testCases) {
        const result = parseJobDetail(`<div class="salary">${tc.input}</div>`, 'https://test.url').salary;
        assert.deepStrictEqual(result, tc.expected, `Test failed for input: "${tc.input}"`);
    }
    console.log('✓ parseSalary testy prešli');
}

function testParsePostedAt() {
    const testCases = [
        {
            input: 'pred 5 dňami',
            daysAgo: 5
        },
        {
            input: 'pred 1 dňom',
            daysAgo: 1
        },
        {
            input: '2025-09-22',
            expected: '2025-09-22T00:00:00.000Z'
        }
    ];

    const now = new Date('2025-10-07T12:00:00.000Z'); // fixný dátum pre testy

    for (const tc of testCases) {
        const html = `<div><span class="posted">${tc.input}</span></div>`;
        const result = parseJobDetail(html, 'https://test.url', now).postedAt;
        if (tc.daysAgo !== undefined) {
            const expected = new Date(now);
            expected.setDate(now.getDate() - tc.daysAgo);
            const expectedDate = expected.toISOString().split('T')[0];
            const actualDate = new Date(result).toISOString().split('T')[0];
            assert.strictEqual(actualDate, expectedDate, `Test failed for input: "${tc.input}"`);
        } else {
            assert.strictEqual(result, tc.expected, `Test failed for input: "${tc.input}"`);
        }
    }
    console.log('✓ parsePostedAt testy prešli');
}

// Spustenie testov
console.log('Spúšťam unit testy pre parser...');
testParseSalary();
testParsePostedAt();
console.log('Všetky testy prešli!');