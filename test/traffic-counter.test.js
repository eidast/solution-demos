import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { frameAtTime, validateAnalysis } from '../apps/computer-vision/traffic-counter/counts.js';
import { createTrafficHandler, parseByteRange } from '../apps/computer-vision/traffic-counter/http.js';

test('playback counts select one frame, including seeking, boundaries, and the final frame', () => {
  const analysis = { schemaVersion: 3, videoId: 'shibuya', mode: 'local-inference-replay', video: { fps: 12, frameCount: 3 }, frames: [
    { frame: 0, people: 1, cars: 4 }, { frame: 1, people: 2, cars: 3 }, { frame: 2, people: 1, cars: 5 },
  ] };
  assert.equal(validateAnalysis(analysis, 'shibuya'), true);
  assert.equal(validateAnalysis(analysis, 'retail-najaf'), false);
  assert.equal(validateAnalysis({ ...analysis, videoId: undefined }), false);
  assert.equal(frameAtTime(analysis, 0).people, 1);
  assert.equal(frameAtTime(analysis, 1 / 12).people, 2);
  assert.equal(frameAtTime(analysis, 0.25).cars, 5);
  assert.equal(frameAtTime(analysis, 0).cars, 4, 'seeking back does not accumulate counts');
  assert.equal(frameAtTime(analysis, -1).frame, 0);
  assert.equal(frameAtTime(analysis, NaN), null);
  assert.equal(frameAtTime({ frames: [] }, 0), null);
  assert.equal(validateAnalysis({ ...analysis, schemaVersion: 4 }), false);
  assert.equal(validateAnalysis({ ...analysis, frames: analysis.frames.slice(1) }), false);
  assert.equal(validateAnalysis({ ...analysis, frames: [{ frame: 0, people: -1, cars: 0 }, ...analysis.frames.slice(1)] }), false);
});

test('media ranges handle open ends and suffixes and reject invalid requests', () => {
  assert.deepEqual(parseByteRange('bytes=0-3', 10), { start: 0, end: 3 });
  assert.deepEqual(parseByteRange('bytes=6-', 10), { start: 6, end: 9 });
  assert.deepEqual(parseByteRange('bytes=-3', 10), { start: 7, end: 9 });
  assert.deepEqual(parseByteRange('bytes=8-50', 10), { start: 8, end: 9 });
  for (const range of ['bytes=-0', 'bytes=-', 'bytes=20-', 'bytes=8-3', 'bytes=0-1,4-5', 'nonsense', 'bytes=99999999999999999-']) {
    assert.throws(() => parseByteRange(range, 10), RangeError, range);
  }
});

test('traffic routes stream only fixed public files and explain unprepared output', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'solution-vision-'));
  mkdirSync(join(directory, 'data/shibuya'), { recursive: true });
  mkdirSync(join(directory, 'data/san-francisco'), { recursive: true });
  writeFileSync(join(directory, 'data/san-francisco/source.mp4'), 'preserved');
  writeFileSync(join(directory, 'index.html'), '<title>Example</title>');
  writeFileSync(join(directory, 'data/shibuya', 'source.mp4'), '0123456789');
  mkdirSync(join(directory, 'third_party'));
  for (const name of ['prepare.py', 'counts.js', 'app.js', 'analysis-job.js', 'http.js', 'third_party/yolox.py', 'third_party/YOLOX-LICENSE']) {
    writeFileSync(join(directory, name), `Public source: ${name} <script>literal text</script>`);
  }
  writeFileSync(join(directory, '.env'), 'PRIVATE_SENTINEL=never_expose');
  const handler = createTrafficHandler(directory);
  const server = http.createServer((req, res) => {
    if (!handler(req, res, new URL(req.url, 'http://localhost').pathname)) { res.writeHead(404); res.end(); }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    rmSync(directory, { recursive: true });
  });
  const base = `http://127.0.0.1:${server.address().port}/computer-vision/traffic-counter`;
  assert.equal((await fetch(base + '/')).status, 200);
  assert.equal(await (await fetch(base + '/videos/san-francisco/source.mp4')).text(), 'preserved');
  assert.equal((await fetch(base + '/videos/not-registered/source.mp4')).status, 404);
  for (const id of ['san-francisco', 'shibuya', 'retail-najaf']) {
    const source = await fetch(base + `/videos/${id}/implementation?file=.env`);
    assert.equal(source.status, 200);
    const implementation = await source.json();
    assert.equal(implementation.videoId, id);
    assert.equal(JSON.parse(implementation.files[0].code).id, id);
    assert.equal(implementation.files.find((file) => file.name === 'prepare.py').code, 'Public source: prepare.py <script>literal text</script>');
    assert.equal(implementation.files.length, 8);
    assert.equal(JSON.stringify(implementation).includes('PRIVATE_SENTINEL'), false);
  }
  assert.equal((await fetch(base + '/videos/unknown/implementation')).status, 404);
  assert.equal((await fetch(base + '/videos/shibuya/implementation', { method: 'POST' })).status, 405);
  const sourceHead = await fetch(base + '/videos/shibuya/implementation', { method: 'HEAD' });
  assert.equal(sourceHead.status, 200);
  assert.equal(await sourceHead.text(), '');
  const clip = await fetch(base + '/source.mp4', { headers: { Range: 'bytes=2-5' } });
  assert.equal(clip.status, 206);
  assert.equal(clip.headers.get('content-range'), 'bytes 2-5/10');
  assert.equal(clip.headers.get('content-length'), '4');
  assert.equal(await clip.text(), '2345');
  const head = await fetch(base + '/source.mp4', { method: 'HEAD' });
  assert.equal(head.headers.get('content-length'), '10');
  assert.equal(await head.text(), '');
  assert.equal((await fetch(base + '/source.mp4', { headers: { Range: 'bytes=12-' } })).status, 416);
  const missing = await fetch(base + '/analysis.json');
  assert.equal(missing.status, 503);
  assert.match((await missing.json()).error, /vision:source/);
  assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405);
  for (const path of ['/.cache/yolox-s.onnx', '/.venv/pyvenv.cfg', '/prepare.py', '/third_party/yolox.py', '/data/source.mp4', '/requirements.txt', '/analysis-job.js', '/prepared-source.json', '/data/prepared-source.json']) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
});
