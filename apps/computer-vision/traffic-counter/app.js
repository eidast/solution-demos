import { setupSourceViewer } from './source-viewer.js';
import { frameAtTime, validateAnalysis } from './counts.js';

const video = document.querySelector('#video');
const picker = document.querySelector('#videoSelect');
const toggle = document.querySelector('#annotations');
const analyzeButton = document.querySelector('#analyze');
const progress = document.querySelector('#progress');
const people = document.querySelector('#people');
const cars = document.querySelector('#cars');
const frameLabel = document.querySelector('#frame');
const status = document.querySelector('#status');
let catalog = [];
let selected;
let analysis;
let pendingSwitch = null;
let processing = false;
let epoch = 0;
let pollingEpoch = null;
setupSourceViewer(() => selected);
const asset = (name, id = selected.id) => `videos/${encodeURIComponent(id)}/${name}`;

function clearCounts() {
  people.value = cars.value = '—';
  frameLabel.textContent = analysis ? 'Loading frame…' : 'Analyze this example to calculate counts';
}
function showCounts(mediaTime) {
  if (pendingSwitch || video.seeking || video.readyState < 2 || !analysis) return;
  const row = frameAtTime(analysis, mediaTime);
  if (!row) return;
  people.value = selected.classes ? row.counts[selected.classes[0].key] : row.people;
  cars.value = selected.classes ? (selected.classes[1] ? row.counts[selected.classes[1].key] : '') : row.cars;
  frameLabel.textContent = `Frame ${row.frame + 1} / ${analysis.video.frameCount} · ${mediaTime.toFixed(2)}s`;
}
function switchView(annotated) {
  pendingSwitch = { time: video.currentTime, resume: !video.paused && !video.ended };
  toggle.checked = annotated; toggle.disabled = true; clearCounts();
  document.querySelector('#viewLabel').textContent = annotated ? 'Detections + HUD' : 'Original · clean video';
  video.src = asset(annotated ? 'annotated.mp4' : 'source.mp4');
  video.load();
}
function finishSwitch() {
  if (!pendingSwitch || video.seeking) return;
  const resume = pendingSwitch.resume;
  pendingSwitch = null; toggle.disabled = !analysis || processing;
  if (resume) video.play().catch(() => { status.textContent = 'View changed. Press Play to continue.'; });
}
video.addEventListener('loadedmetadata', () => { if (pendingSwitch) video.currentTime = pendingSwitch.time; });
video.addEventListener('loadeddata', () => {
  if (pendingSwitch && Math.abs(video.currentTime - pendingSwitch.time) > 1 / selected.fps) return;
  finishSwitch(); showCounts(video.currentTime);
});
video.addEventListener('seeking', clearCounts);
video.addEventListener('seeked', () => { finishSwitch(); showCounts(video.currentTime); });
for (const event of ['timeupdate', 'pause', 'ended']) video.addEventListener(event, () => showCounts(video.currentTime));
video.addEventListener('error', () => {
  clearCounts(); status.textContent = 'This example is not prepared or could not be loaded. Prepare its source, then reload.';
  document.querySelector('#recovery').hidden = false;
});
toggle.addEventListener('change', () => switchView(toggle.checked));
if ('requestVideoFrameCallback' in video) {
  const onFrame = (_, metadata) => { showCounts(metadata.mediaTime); video.requestVideoFrameCallback(onFrame); };
  video.requestVideoFrameCallback(onFrame);
}

async function loadAnalysis(version) {
  const id = selected.id;
  const response = await fetch(asset('analysis.json', id), { cache: 'no-store' });
  if (!response.ok) throw new Error('Analysis unavailable');
  const result = await response.json();
  if (version !== epoch) return false;
  if (!validateAnalysis(result, id, selected.classes, selected.inputColor)) throw new Error('Analysis does not match the selected example');
  analysis = result; toggle.disabled = processing; analyzeButton.textContent = 'Analyze again';
  showCounts(video.currentTime);
  return true;
}
function presentJob(job) {
  processing = job.state === 'running';
  analyzeButton.disabled = !!job.activeVideoId || !job.runtimeReady;
  toggle.disabled = processing || !analysis;
  progress.hidden = !processing; progress.value = job.completed; progress.max = job.total;
  if (processing) {
    analyzeButton.textContent = 'Analyzing…';
    status.textContent = job.stage === 'encoding' ? 'Encoding this example’s HUD video…' : `Calculating ${selected.title}: ${job.completed} / ${job.total} frames (${Math.floor(job.completed / job.total * 100)}%).`;
  } else if (job.activeVideoId) {
    analyzeButton.textContent = 'Analysis busy';
    status.textContent = `Another example is being analyzed (${catalog.find((item) => item.id === job.activeVideoId)?.title || job.activeVideoId}). You can watch this original or select that example to follow progress.`;
  } else if (job.state === 'error') {
    status.textContent = job.error; analyzeButton.textContent = 'Retry analysis';
  } else if (!job.runtimeReady) {
    status.textContent = 'Prepare this example’s local source first. Other examples and their results are preserved.';
    document.querySelector('#recovery').hidden = false;
  }
}
async function pollJob(version) {
  if (pollingEpoch === version) return;
  pollingEpoch = version;
  try {
    while (version === epoch) {
      const response = await fetch(asset('analysis-status'), { cache: 'no-store' });
      if (!response.ok) throw new Error('Status unavailable');
      const job = await response.json();
      if (version !== epoch) return;
      presentJob(job);
      if (job.state !== 'running' && !job.activeVideoId) {
        if (job.state === 'ready' && await loadAnalysis(version)) {
          status.textContent = `Calculated ${selected.title}: ${analysis.video.frameCount} frames in ${analysis.processingSeconds}s. Counts are detections per frame, not unique totals.`;
          switchView(true);
        } else if (job.state === 'idle' && job.runtimeReady) {
          analyzeButton.textContent = analysis ? 'Analyze again' : 'Analyze video';
          status.textContent = 'This example is ready. Use Analyze video to calculate its own HUD; other results stay separate.';
        }
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 750));
    }
  } catch {
    if (version === epoch) { status.textContent = 'Could not read status. Reload to reconnect to any running local job.'; analyzeButton.disabled = false; }
  } finally { if (pollingEpoch === version) pollingEpoch = null; }
}

function renderCredits() {
  const source = selected.source;
  const link = (text, href) => { const a = document.createElement('a'); a.textContent = text; a.href = href; return a; };
  const credits = document.querySelector('#credits');
  credits.replaceChildren('Footage: ', link(source.title, source.page), ' by ', link(source.author, source.authorUrl), ' · ', link(source.license, source.licenseUrl), '. ', source.changes, ' No endorsement implied.');
}
async function chooseVideo(id) {
  const choice = catalog.find((item) => item.id === id);
  if (!choice) return;
  const version = ++epoch;
  selected = choice; document.querySelector('#viewSource').disabled = false; analysis = undefined; pendingSwitch = null; processing = false;
  picker.value = id; clearCounts(); toggle.checked = false; toggle.disabled = true;
  analyzeButton.disabled = true; analyzeButton.textContent = 'Analyze video'; progress.hidden = true;
  document.querySelector('#recovery').hidden = true;
  document.querySelector('#viewLabel').textContent = 'Original · clean video';
  document.querySelector('#videoDescription').textContent = choice.description;
  document.querySelector('#clipInfo').textContent = `${choice.source.durationSeconds}-second excerpt · ${choice.width}×${choice.height} · Silent`;
  document.querySelector('#limitation').textContent = choice.limitation;
  document.querySelector('#pipelineDescription').textContent = `Analyze video runs YOLOX-S and Supervision locally on this example’s ${choice.fps * choice.source.durationSeconds} frames at ${choice.fps} FPS. Each video keeps its own source, HUD and results.`;
  const fruit = !!choice.classes;
  document.title = fruit ? 'Fruit Counter · Solution Demos' : 'People & Cars · Solution Demos';
  document.querySelector('h1').textContent = fruit ? 'Fruit. Counted in view.' : 'People. Cars. Counted in view.';
  document.querySelector('.metric.people h2').textContent = fruit ? choice.classes[0].label : 'People';
  people.setAttribute('aria-label', fruit ? `${choice.classes[0].label} detected in this frame` : 'People detected in this frame');
  document.querySelector('.metric.cars').hidden = fruit && choice.classes.length < 2;
  document.querySelector('.metric.cars h2').textContent = fruit ? (choice.classes[1]?.label || '') : 'Cars';
  cars.setAttribute('aria-label', fruit ? `${choice.classes[1]?.label || 'Objects'} detected in this frame` : 'Cars detected in this frame');
  document.querySelector('.definition').textContent = fruit ? `${choice.classes.map((item) => item.label).join(' and ')} detections in this frame. Occluded or unsupported fruit is not a complete stock count; zero means no accepted detection.` : 'Visible detections, not a running total. Cars exclude buses, trucks, bicycles, and motorcycles.';
  document.querySelector('#method').textContent = `Confidence threshold: 35% · Class-aware NMS: 0.5 IoU${fruit ? ` · COCO ${choice.classes.map((item) => `${item.id}: ${item.name}`).join(', ')}` : ''}`;
  renderCredits();
  video.src = asset('source.mp4'); video.load();
  const location = new URL(window.location.href); location.searchParams.set('video', id); history.replaceState(null, '', location);
  status.textContent = `Loading ${choice.title}…`;
  try {
    const response = await fetch(asset('analysis-status'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Status unavailable');
    const job = await response.json();
    if (version !== epoch) return;
    presentJob(job);
    if (job.analysisReady && job.state !== 'running') await loadAnalysis(version);
    if (version !== epoch) return;
    if (job.state === 'running' || job.activeVideoId) await pollJob(version);
    else if (job.runtimeReady) status.textContent = analysis ? 'This example’s saved calculation is loaded. Watch the clean original or enable detections + HUD; Analyze again recomputes only this example.' : 'Original ready. Analyze video calculates this example; the other demos are preserved.';
  } catch {
    if (version === epoch) status.textContent = 'No valid analysis is available for this example. Watch its original or prepare it locally.';
  }
}
analyzeButton.addEventListener('click', async () => {
  const version = epoch;
  analyzeButton.disabled = true;
  try {
    const response = await fetch(asset('analyze'), { method: 'POST', headers: { 'X-Demo-Action': 'analyze' } });
    const job = await response.json();
    if (version !== epoch) return;
    if (!response.ok && response.status !== 409) { status.textContent = job.error; analyzeButton.disabled = false; return; }
    if (response.ok) {
      processing = true; analysis = undefined; clearCounts();
      if (toggle.checked) switchView(false);
      presentJob(job);
    }
    await pollJob(version);
  } catch { if (version === epoch) { status.textContent = 'Could not start local analysis. Check the server and retry.'; analyzeButton.disabled = false; } }
});
picker.addEventListener('change', () => chooseVideo(picker.value));
try {
  const response = await fetch('videos.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Catalog unavailable');
  catalog = await response.json();
  for (const item of catalog) { const option = document.createElement('option'); option.value = item.id; option.textContent = item.title; picker.append(option); }
  picker.disabled = false;
  const requested = new URL(window.location.href).searchParams.get('video');
  await chooseVideo(catalog.some((item) => item.id === requested) ? requested : 'apple-press');
} catch { status.textContent = 'The video gallery could not be loaded. Check the local server and reload.'; }
