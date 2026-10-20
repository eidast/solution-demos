import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

test('workspace server preserves routes and private boundaries from another working directory', async (t) => {
  const child = spawn(process.execPath, [fileURLToPath(new URL('../apps/showcase/server.js', import.meta.url))], {
    cwd: tmpdir(), env: { ...process.env, PORT: '0', HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(async () => {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  });
  const base = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timed out')), 5000);
    child.once('error', (error) => { clearTimeout(timeout); reject(error); });
    child.once('exit', () => { clearTimeout(timeout); reject(new Error('Server exited before startup')); });
    child.stdout.on('data', (chunk) => {
      const match = chunk.toString().match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) { clearTimeout(timeout); resolve(`http://127.0.0.1:${match[1]}`); }
    });
  });
  for (const path of ['/', '/MoralMachine/', '/TicTacToe/', '/CoinToss/', '/MoralMachine/app.js', '/TicTacToe/style.css', '/CoinToss/app.js', '/MoralMachine/assets.html', '/MoralMachine/assets/moral-machine/man_passenger.svg']) {
    assert.equal((await fetch(base + path)).status, 200, path);
  }
  const catalog = await (await fetch(base + '/')).text();
  assert.match(catalog, /Solution Demos/);
  assert.match(catalog, /Open computer vision demo/);
  const scenarios = await (await fetch(base + '/api/scenarios')).json();
  assert.equal(scenarios.scenarios.length, 13);
  for (const path of ['/.env', '/server.js', '/apps/showcase/server.js', '/apps/jev/moral-machine/reports/example.json', '/MoralMachine/reports/example.json', '/TicTacToe/session.js', '/CoinToss/experiment.js', '/package.json']) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
});
