/**
 * Server runner for AI Studio & local development environments.
 * Starts Hugo server listening on port 3000 (or PORT env var) bound to 0.0.0.0.
 * Automatically accepts and adapts parameters passed by AI Studio or pnpm.
 */
const { spawn } = require('child_process');

let port = process.env.PORT || '3000';
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--port' && process.argv[i + 1]) {
    port = process.argv[i + 1];
  }
}

const baseUrl = `http://localhost:${port}/`;
console.log(`[Survival Kit] Launching Hugo server on port ${port} with baseURL ${baseUrl}...`);

const hugo = spawn(
  'hugo',
  [
    'server',
    '--bind', '0.0.0.0',
    '-p', String(port),
    '--baseURL', baseUrl,
    '--buildDrafts',
    '--buildFuture',
    '--renderStaticToDisk'
  ],
  {
    stdio: 'inherit'
  }
);

hugo.on('exit', (code) => {
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  hugo.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  hugo.kill('SIGTERM');
  process.exit(0);
});
