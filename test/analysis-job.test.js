import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter, once } from 'node:events';
import { PassThrough } from 'node:stream';
import http from 'node:http';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createAnalysisJob, createAnalysisManager } from '../apps/computer-vision/traffic-counter/analysis-job.js';
import { createTrafficHandler } from '../apps/computer-vision/traffic-counter/http.js';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'vision-job-'));
  for (const name of ['.venv/bin', 'data/shibuya', '.cache']) mkdirSync(join(root, name), { recursive: true });
  for (const name of ['.venv/bin/python', 'prepare.py', 'data/shibuya/source.mp4', 'data/shibuya/prepared-source.json', '.cache/yolox-s.onnx']) writeFileSync(join(root, name), 'test');
  t.after(() => rmSync(root, { recursive: true }));
  const child = new EventEmitter();
  child.stdout = new PassThrough(); child.stderr = new PassThrough();
  child.kill = () => queueMicrotask(() => child.emit('close', null));
  return { root, child };
}

test('fixed local worker is single-flight, filters progress, and receives no provider environment', (t) => {
  const { root, child } = fixture(t);
  let launches = 0;
  const job = createAnalysisJob(root, (command, args, options) => {
    launches++;
    assert.equal(command, join(root, '.venv/bin/python'));
    assert.deepEqual(args, [join(root, 'prepare.py'), '--analyze', '--video', 'shibuya']);
    assert.equal(options.shell, false);
    assert.equal(Object.hasOwn(options.env, 'OPENROUTER_API_KEY'), false);
    assert.equal(Object.hasOwn(options.env, 'AI_GATEWAY_API_KEY'), false);
    assert.ok(Object.keys(options.env).every((key) => ['PATH', 'HOME', 'TMPDIR', 'PYTHONUNBUFFERED'].includes(key)));
    return child;
  });
  assert.equal(job.start().status, 202);
  assert.equal(job.start().status, 409);
  assert.equal(launches, 1);
  child.stdout.write('{"stage":"analyzing","completed":24,"total":540}\n');
  child.stdout.write('{"stage":"analyzing","completed":12,"total":540}\n');
  child.stdout.write('{"stage":"analyzing","completed":999999,"total":540}\n');
  assert.equal(job.status().completed, 24);
  writeFileSync(join(root, 'data/shibuya/analysis.json'), JSON.stringify({ schemaVersion: 3, videoId: 'shibuya', generatedAt: new Date().toISOString(), video: { frameCount: 540 } }));
  writeFileSync(join(root, 'data/shibuya/annotated.mp4'), 'test video');
  child.emit('close', 0);
  assert.equal(job.status().state, 'ready');
  assert.equal(job.status().completed, 540);
});

test('worker failure exposes a controlled error', (t) => {
  const { root, child } = fixture(t);
  const job = createAnalysisJob(root, () => child);
  job.start();
  child.stderr.write('private diagnostic contents');
  child.emit('error', new Error('private exception contents'));
  assert.equal(job.status().state, 'error');
  assert.doesNotMatch(job.status().error, /private/);
});

test('timeout kills the worker before releasing the job lock', async (t) => {
  const { root, child } = fixture(t);
  let killed = false;
  child.kill = (signal) => {
    assert.equal(signal, 'SIGKILL'); killed = true;
    assert.equal(job.start().status, 409);
    queueMicrotask(() => child.emit('close', null));
  };
  const job = createAnalysisJob(root, () => child, 10);
  const closed = once(child, 'close');
  const keepAlive = setTimeout(() => {}, 1000);
  t.after(() => clearTimeout(keepAlive));
  job.start();
  await closed;
  assert.equal(killed, true);
  assert.equal(job.status().state, 'error');
  assert.match(job.status().error, /exceeded/);
});

test('analysis HTTP action requires loopback same-origin and forbids user input', async (t) => {
  const { root } = fixture(t);
  let launches = 0;
  const fakeJob = { start: () => { launches++; return { status: 202 }; }, status: () => ({ state: 'running', completed: 0, total: 540 }) };
  const handler = createTrafficHandler(root, fakeJob);
  const server = http.createServer((req, res) => handler(req, res, new URL(req.url, 'http://localhost').pathname));
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const url = origin + '/computer-vision/traffic-counter/analyze';
  const headers = { Origin: origin, 'X-Demo-Action': 'analyze' };
  assert.equal((await fetch(url, { method: 'POST' })).status, 403);
  assert.equal((await fetch(url, { method: 'POST', headers: { ...headers, Origin: 'https://external.example' } })).status, 403);
  assert.equal((await fetch(url, { method: 'POST', headers, body: '{}' })).status, 403);
  assert.equal((await fetch(url)).status, 405);
  assert.equal(launches, 0);
  assert.equal((await fetch(url, { method: 'POST', headers })).status, 202);
  assert.equal(launches, 1);
});

test('gallery manager permits one worker globally without replacing another video job', () => {
  const states = new Map();
  const launches = [];
  const manager = createAnalysisManager('/unused', (id) => {
    states.set(id, 'idle');
    return { status: () => ({ state: states.get(id) }), start: () => { launches.push(id); states.set(id, 'running'); return { status: 202 }; } };
  });
  assert.equal(manager.start('shibuya').status, 202);
  assert.equal(manager.start('retail-najaf').status, 409);
  assert.equal(manager.status('retail-najaf').activeVideoId, 'shibuya');
  assert.deepEqual(launches, ['shibuya']);
  states.set('shibuya', 'ready');
  assert.equal(manager.start('retail-najaf').status, 202);
  assert.equal(manager.status('san-francisco').activeVideoId, 'retail-najaf');
  assert.deepEqual(launches, ['shibuya', 'retail-najaf']);
});
