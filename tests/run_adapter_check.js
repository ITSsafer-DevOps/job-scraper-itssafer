import { ProfesiaAdapter } from '../src/adapters/ProfesiaAdapter.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const adapter = new ProfesiaAdapter({
    startUrl: process.env.START_URL || 'https://www.profesia.sk/praca/',
    concurrency: 1,
    maxPages: 0,
    delayMin: 100,
    delayMax: 200,
  });
  const jobs = await adapter.crawl();
  console.log('Adapter check completed, jobs length =', jobs.length);
})();
