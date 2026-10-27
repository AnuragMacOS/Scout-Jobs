const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

function runService(name, cwd, command, args, color) {
  const child = spawn(command, args, {
    cwd: path.resolve(rootDir, cwd),
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(`${color}[${name}]\x1b[0m ${data.toString()}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`${color}[${name}]\x1b[0m ${data.toString()}`);
  });

  child.on('close', (code) => {
    console.log(`${color}[${name}]\x1b[0m process exited with code ${code}`);
  });

  return child;
}

console.log('\x1b[36m🚀 Starting Scout Backend & Frontend development servers...\x1b[0m\n');

const serverProc = runService('server', 'server', 'npm', ['run', 'dev'], '\x1b[33m');
const clientProc = runService('client', 'client', 'npm', ['run', 'dev'], '\x1b[32m');

function cleanup() {
  console.log('\n\x1b[36mShutting down services...\x1b[0m');
  try { serverProc.kill('SIGTERM'); } catch {}
  try { clientProc.kill('SIGTERM'); } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
