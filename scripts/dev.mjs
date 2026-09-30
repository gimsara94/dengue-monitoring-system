import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const workspaces = ['dengue-backend', 'dengue-frountend'];

const processes = workspaces.map((workspace) =>
  spawn(npmCommand, ['run', 'dev', `--workspace=${workspace}`], {
    stdio: 'inherit',
  }),
);

let shuttingDown = false;

function stop(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) child.kill('SIGTERM');
  }

  process.exitCode = exitCode;
}

for (const child of processes) {
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });

  child.on('exit', (code, signal) => {
    if (!shuttingDown && code !== 0 && signal === null) stop(code ?? 1);
  });
}

process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));
