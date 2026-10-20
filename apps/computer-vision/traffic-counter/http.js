import { createReadStream, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAnalysisManager, isLocalAnalysisRequest, videos } from './analysis-job.js';

const prefix = '/computer-vision/traffic-counter';
const publicFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/videos.json', ['videos.json', 'application/json; charset=utf-8']],
  ['/counts.js', ['counts.js', 'text/javascript; charset=utf-8']],
  ['/source.mp4', ['data/shibuya/source.mp4', 'video/mp4']],
  ['/annotated.mp4', ['data/shibuya/annotated.mp4', 'video/mp4']],
  ['/analysis.json', ['data/shibuya/analysis.json', 'application/json; charset=utf-8']],
]);

export function parseByteRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || size < 1) throw new RangeError('Invalid byte range');
  const suffix = !match[1];
  const first = Number(match[1]);
  const last = Number(match[2]);
  if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last)) throw new RangeError('Invalid byte range');
  const start = suffix ? Math.max(0, size - last) : first;
  const end = suffix || !match[2] ? size - 1 : Math.min(last, size - 1);
  if (start >= size || start > end) throw new RangeError('Unsatisfiable byte range');
  return { start, end };
}

export function createTrafficHandler(directory = fileURLToPath(new URL('.', import.meta.url)), job = createAnalysisManager(directory)) {
  return function handleTraffic(req, res, pathname) {
    if (pathname !== prefix && !pathname.startsWith(prefix + '/')) return false;
    const reply = (code, value) => {
      const body = JSON.stringify(value);
      res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body) });
      res.end(body);
    };
    const registered = pathname.slice(prefix.length).match(/^\/videos\/([a-z0-9-]+)\/(source\.mp4|annotated\.mp4|analysis\.json|analyze|analysis-status)$/);
    const videoId = registered ? registered[1] : 'shibuya';
    if (registered && !videos.some((video) => video.id === videoId)) { reply(404, { error: 'Unknown registered video.' }); return true; }
    const action = registered ? registered[2] : pathname.slice(prefix.length + 1);
    if (action === 'analyze') {
      if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); res.end(); return true; }
      if (!isLocalAnalysisRequest(req)) { reply(403, { error: 'Analysis requires a bodyless same-origin request from the local demo.' }); return true; }
      const result = job.start(videoId);
      reply(result.status, result.error ? result : job.status(videoId));
      return true;
    }
    if (action === 'analysis-status' && req.method === 'GET') {
      reply(200, job.status(videoId));
      return true;
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return true;
    }
    if (pathname === prefix) {
      res.writeHead(308, { Location: prefix + '/' });
      res.end();
      return true;
    }
    const asset = registered && ['source.mp4', 'annotated.mp4', 'analysis.json'].includes(action)
      ? [`data/${videoId}/${action}`, action.endsWith('.mp4') ? 'video/mp4' : 'application/json; charset=utf-8']
      : publicFiles.get(pathname.slice(prefix.length));
    if (!asset) {
      res.writeHead(404);
      res.end();
      return true;
    }
    const [relative, contentType] = asset;
    const file = join(directory, relative);
    if (!existsSync(file)) {
      const message = JSON.stringify({ error: 'Example not prepared. Run npm run vision:setup, then npm run vision:source; use Analyze video in the demo to calculate counts.' });
      res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(message) });
      res.end(req.method === 'HEAD' ? undefined : message);
      return true;
    }
    const size = statSync(file).size;
    const media = contentType === 'video/mp4';
    let range;
    if (media && req.headers.range) {
      try { range = parseByteRange(req.headers.range, size); }
      catch {
        res.writeHead(416, { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' });
        res.end();
        return true;
      }
    }
    const headers = { 'Content-Type': contentType, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Length': range ? range.end - range.start + 1 : size };
    if (media) headers['Accept-Ranges'] = 'bytes';
    if (range) headers['Content-Range'] = `bytes ${range.start}-${range.end}/${size}`;
    res.writeHead(range ? 206 : 200, headers);
    if (req.method === 'HEAD') res.end();
    else {
      const stream = createReadStream(file, range);
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    }
    return true;
  };
}

export const handleTraffic = createTrafficHandler();
