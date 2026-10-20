import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const videos = JSON.parse(readFileSync(new URL('./videos.json', import.meta.url), 'utf8'));

export function isLocalAnalysisRequest(req) {
  try {
    const origin = new URL(req.headers.origin);
    const loopback = new Set(['127.0.0.1', 'localhost', '[::1]']);
    return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress) &&
      origin.protocol === 'http:' && loopback.has(origin.hostname) && origin.host === req.headers.host &&
      req.headers['x-demo-action'] === 'analyze' && !req.headers['transfer-encoding'] &&
      (!req.headers['content-length'] || req.headers['content-length'] === '0') &&
      (!req.headers['sec-fetch-site'] || req.headers['sec-fetch-site'] === 'same-origin');
  } catch { return false; }
}

export function createAnalysisJob(directory, launch = spawn, timeoutMs = 300_000, videoId = 'shibuya') {
  let state = 'idle';
  let completed = 0;
  let stage = 'idle';
  let error = null;
  const python = join(directory, '.venv', 'bin', 'python');
  const script = join(directory, 'prepare.py');
  const video = videos.find((item) => item.id === videoId);
  if (!video) throw new Error('Unknown registered video');
  const total = video.fps * video.source.durationSeconds;
  const output = join(directory, 'data', videoId);
  const source = join(output, 'source.mp4');
  const analysis = join(output, 'analysis.json');
  const prerequisites = [python, script, source, join(output, 'prepared-source.json'), join(directory, '.cache', 'yolox-s.onnx')];
  return {
    status() {
      return { state, stage, completed, total, error, sourceReady: existsSync(source), analysisReady: existsSync(analysis), runtimeReady: prerequisites.every(existsSync) };
    },
    start() {
      if (state === 'running') return { status: 409, error: 'This video is already being analyzed.' };
      if (!prerequisites.every(existsSync)) return { status: 503, error: 'Prepare the local runtime and source first: npm run vision:setup, then npm run vision:source.' };
      state = 'running'; completed = 0; stage = 'starting'; error = null;
      const started = Date.now();
      const env = Object.fromEntries(Object.entries({ PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR, PYTHONUNBUFFERED: '1' }).filter(([, value]) => value !== undefined));
      let child;
      let timer;
      let settled = false;
      const fail = (message) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        state = 'error'; stage = 'error'; error = message;
      };
      try {
        child = launch(python, [script, '--analyze', '--video', videoId], { cwd: directory, env, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
        let buffer = '';
        child.stdout.on('data', (chunk) => {
          buffer += chunk.toString();
          if (buffer.length > 8192) { buffer = ''; return; }
          const lines = buffer.split('\n'); buffer = lines.pop();
          for (const line of lines) {
            try {
              const progress = JSON.parse(line);
              if (['analyzing', 'encoding', 'ready'].includes(progress.stage) && progress.total === total && Number.isInteger(progress.completed) && progress.completed >= completed && progress.completed <= total) {
                stage = progress.stage; completed = progress.completed;
              }
            } catch { /* Worker output other than progress is not exposed. */ }
          }
        });
        child.stderr.resume();
        child.on('error', () => fail('The local analysis worker could not start. Run npm run vision:setup and retry.'));
        child.on('close', (code) => {
          if (settled) return;
          if (code !== 0) return fail(error || 'Local analysis failed. Check the local setup or run npm run vision:prepare from Terminal, then retry.');
          try {
            const result = JSON.parse(readFileSync(analysis, 'utf8'));
            if (result.schemaVersion !== (video.classes ? 4 : 3) || result.videoId !== videoId || result.video?.frameCount !== total || Date.parse(result.generatedAt) < started - 1000 || !Number.isFinite(Date.parse(result.generatedAt)) || !existsSync(join(output, 'annotated.mp4'))) throw new Error('Incomplete output');
            settled = true; clearTimeout(timer); state = 'ready'; stage = 'ready'; completed = total;
          } catch { fail('The analysis did not produce a complete result. Run npm run vision:prepare and retry.'); }
        });
        timer = setTimeout(() => {
          // Keep the job locked until the operating system confirms the worker exited.
          error = 'The local analysis exceeded five minutes. Check the runtime and retry.';
          stage = 'stopping';
          child.kill('SIGKILL');
        }, timeoutMs);
        timer.unref?.();
      } catch { fail('The local analysis worker could not start. Check the Python runtime.'); }
      return state === 'error' ? { status: 503, error } : { status: 202 };
    },
  };
}

export function createAnalysisManager(directory, makeJob = (id) => createAnalysisJob(directory, spawn, 300_000, id)) {
  const jobs = new Map(videos.map((video) => [video.id, makeJob(video.id)]));
  let active = null;
  const busy = () => active && jobs.get(active).status().state === 'running' ? active : null;
  return {
    status(id) { return { ...jobs.get(id).status(), activeVideoId: busy(), videoId: id }; },
    start(id) {
      const running = busy();
      if (running) return { status: 409, error: 'Another registered video is already being analyzed.', activeVideoId: running };
      const result = jobs.get(id).start();
      if (result.status === 202) active = id;
      return result;
    },
  };
}
