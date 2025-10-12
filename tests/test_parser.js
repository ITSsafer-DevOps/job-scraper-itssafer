import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
import { parseJobDetail } from '../src/parsers/jobDetailParser.js';

const html = fs.readFileSync('./tests/detail.html', 'utf-8');
const url = 'https://www.profesia.sk/praca/fedors-group/O5161946?search_id=35a41404-3cd0-40bd-9159-5cffe1b158b2';
const job = parseJobDetail(html, url);
console.log('Parsed job detail:', job);
