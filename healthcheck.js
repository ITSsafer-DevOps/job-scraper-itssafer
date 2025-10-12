import { access, constants } from 'fs/promises';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

async function healthCheck() {
    try {
        // Check if Node.js process is running and responsive
        const { stdout } = await exec('ps aux | grep "[n]ode"');
        if (!stdout) {
            throw new Error('No Node.js process found');
        }

        // Check if output directory exists and is writable
        await access('output', constants.W_OK);

        // Check if required directories exist and are writable
        const requiredDirs = ['output', 'storage'];
        await Promise.all(
            requiredDirs.map(dir => access(dir, constants.W_OK))
        );

        console.log('Health check passed');
        process.exit(0);
    } catch (error) {
        console.error('Health check failed:', error.message);
        process.exit(1);
    }
}

healthCheck();