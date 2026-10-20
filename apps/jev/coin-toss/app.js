const el = (id) => document.getElementById(id);
const start = el('start');
const pause = el('pause');
const resume = el('resume');
const step = el('step');
const newRun = el('newRun');
let run = null;
let running = false;
let stopRequested = false;
let requestPending = false;
let ready = false;
const methods = ['choice', 'noul', 'score'];

async function api(path, method = 'GET') {
  const response = await fetch(path, method === 'GET' ? {} : {
    method, headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function render() {
  const complete = run?.completed === 100;
  el('results').hidden = !run;
  start.hidden = !!run;
  start.disabled = !ready || requestPending;
  pause.hidden = !run || !running || complete;
  pause.disabled = !running || stopRequested;
  resume.hidden = !run || running || complete;
  resume.disabled = requestPending;
  step.hidden = !run || running || complete;
  step.disabled = requestPending;
  newRun.hidden = !run;
  newRun.disabled = requestPending || running;
  if (!run) return;
  el('heads').textContent = run.summary.heads;
  el('tails').textContent = run.summary.tails;
  el('progress').textContent = `${run.completed} / 100`;
  el('meterFill').style.width = `${run.completed}%`;
  document.querySelector('.meter').setAttribute('aria-valuenow', String(run.completed));
  el('winner').textContent = complete
    ? run.summary.winner === 'tie' ? 'Tie · 50 heads, 50 tails'
      : `${run.summary.winner === 'heads' ? 'Heads' : 'Tails'} wins this run · ${Math.max(run.summary.heads, run.summary.tails)} to ${Math.min(run.summary.heads, run.summary.tails)}`
    : '';
  methods.forEach((method) => {
    const counts = run.summary.methods[method];
    const covered = run.completed - counts.abstained;
    el(`${method}Accuracy`).textContent = `${counts.correct} / ${covered}`;
    el(`${method}Mix`).textContent = `Heads ${counts.predictedHeads} · tails ${counts.predictedTails}`
      + (method === 'choice' ? '' : ` · undecided ${counts.abstained}`);
    el(`${method}Brier`).textContent = `Brier ${counts.meanBrier === null ? '—' : counts.meanBrier.toFixed(3)}`;
  });
  el('logPath').textContent = `apps/jev/coin-toss/logs/${run.id}.jsonl`;
  const tbody = el('trace');
  const scroller = tbody.closest('.table-wrap');
  const followLatest = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 80;
  while (tbody.rows.length < run.tosses.length) {
    const toss = run.tosses[tbody.rows.length];
    const row = tbody.insertRow();
    const values = [toss.number, toss.outcome, ...methods.map((method) => {
      const value = toss.predictions[method];
      const signal = method === 'score' ? value.position : value.forecastHeads;
      return `${value.prediction || 'undecided'} · ${value.correct === null ? 'no side' : value.correct ? 'hit' : 'miss'} · ${signal.toFixed(3)}`;
    }), `${toss.durationMs} ms`];
    values.forEach((value, index) => {
      const cell = row.insertCell();
      cell.textContent = value;
      if (index === 1) cell.className = value;
    });
  }
  if (followLatest) scroller.scrollTop = scroller.scrollHeight;
}

async function tossOnce() {
  requestPending = true;
  render();
  try {
    run = await api(`/api/coin-toss/runs/${run.id}/toss`, 'POST');
    el('error').hidden = true;
    el('status').textContent = run.completed === 100
      ? 'Run complete. Compare the three Jev methods below.'
      : `Toss ${run.completed} of 100: coin ${run.tosses.at(-1).outcome}.`;
    render();
    return true;
  } catch (error) {
    // If the response was lost after the server committed a toss, read its state before retrying.
    try { run = await api(`/api/coin-toss/runs/${run.id}`); } catch { /* Keep the last known state. */ }
    el('error').textContent = `${error.message} Check the count, then continue or try one toss again.`;
    el('error').hidden = false;
    el('status').textContent = `Stopped at ${run.completed} of 100.`;
    render();
    return false;
  } finally {
    requestPending = false;
    render();
  }
}

async function runRemaining() {
  running = true;
  stopRequested = false;
  render();
  while (run && run.completed < 100 && !stopRequested) {
    if (!await tossOnce()) break;
  }
  running = false;
  if (run.completed === 100) el('status').textContent = 'Run complete. Compare the three Jev methods below.';
  else if (stopRequested) el('status').textContent = `Paused after ${run.completed} tosses.`;
  render();
}

start.addEventListener('click', async () => {
  start.disabled = true;
  el('status').textContent = 'Creating run…';
  try {
    run = await api('/api/coin-toss/runs', 'POST');
    el('error').hidden = true;
    render();
    await runRemaining();
  } catch (error) {
    el('error').textContent = error.message;
    el('error').hidden = false;
    el('status').textContent = 'Run could not start.';
    render();
  }
});
pause.addEventListener('click', () => { stopRequested = true; pause.disabled = true; });
resume.addEventListener('click', runRemaining);
step.addEventListener('click', tossOnce);
newRun.addEventListener('click', () => {
  run = null;
  el('trace').replaceChildren();
  el('error').hidden = true;
  el('status').textContent = 'Ready for a new run.';
  render();
});

api('/api/coin-toss/status').then((status) => {
  ready = status.ready;
  el('connection').textContent = ready ? `Connected through ${status.provider}.` : 'Add a Jev provider key to .env and restart the server.';
  el('status').textContent = ready ? 'Ready to begin. A complete run uses 100 provider calls.' : 'Jev is not configured.';
  render();
}).catch(() => { el('connection').textContent = 'Could not reach the local server.'; });
