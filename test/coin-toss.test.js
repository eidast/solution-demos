import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { callJevToss, summarizeTosses, tossQuestions, validateTossAnswers } from '../apps/jev/coin-toss/experiment.js';
import { createRun, nextToss } from '../apps/jev/coin-toss/session.js';

function providerAnswers(noul = 0.2, score = 0.5) {
  return { answers: {
    choice: { choice: 'heads', probabilities: { heads: 0.8, tails: 0.2 } },
    noul: { noul },
    score: { score, probabilities: { '0': 1 - score, '1': score } },
  } };
}

test('one request carries all three primitives against the same future coin state', () => {
  const request = tossQuestions(1, 'openrouter');
  assert.equal(request.state.toss_number, 1);
  assert.deepEqual(Object.keys(request.questions), ['choice', 'noul', 'score']);
  assert.equal(request.questions.choice.type, 'choice');
  assert.equal(request.questions.noul.type, 'noul');
  assert.equal(request.questions.score.type, 'score');
  assert.deepEqual(request.questions.score.criteria, ['The coin lands tails.', 'The coin lands heads.']);
  assert.equal(tossQuestions(1, 'vercel').questions.noul.type, 'boolean');
  assert.throws(() => tossQuestions(0, 'openrouter'));
});

test('three answers are validated and exact half signals abstain', () => {
  const result = validateTossAnswers(providerAnswers().answers, 'openrouter');
  assert.equal(result.choice.prediction, 'heads');
  assert.equal(result.noul.prediction, 'tails');
  assert.equal(result.score.prediction, null);
  assert.equal(result.score.position, 0.5);
  assert.equal(result.score.forecastHeads, 0.5);
  assert.throws(() => validateTossAnswers({ ...providerAnswers().answers, noul: {} }, 'openrouter'), /invalid noul/);
  assert.throws(() => validateTossAnswers({ ...providerAnswers().answers, score: { score: 2 } }, 'openrouter'), /invalid score/);
  assert.throws(() => validateTossAnswers({ ...providerAnswers().answers, choice: { choice: 'edge' } }, 'openrouter'), /invalid choice/);
});

test('winner uses coin outcomes while method coverage and accuracy remain separate', () => {
  const predictions = {
    choice: { prediction: 'heads', correct: true, forecastHeads: 0.8 },
    noul: { prediction: 'tails', correct: false, forecastHeads: 0.2 },
    score: { prediction: null, correct: null, forecastHeads: 0.5 },
  };
  const heads = Array.from({ length: 50 }, () => ({ outcome: 'heads', predictions }));
  const tails = Array.from({ length: 50 }, () => ({ outcome: 'tails', predictions: {
    choice: { prediction: 'heads', correct: false, forecastHeads: 0.8 },
    noul: { prediction: 'tails', correct: true, forecastHeads: 0.2 },
    score: { prediction: null, correct: null, forecastHeads: 0.5 },
  } }));
  assert.equal(summarizeTosses(heads).winner, null);
  const summary = summarizeTosses([...heads, ...tails]);
  assert.deepEqual({ heads: summary.heads, tails: summary.tails, winner: summary.winner }, { heads: 50, tails: 50, winner: 'tie' });
  assert.equal(summary.methods.choice.correct, 50);
  assert.equal(summary.methods.choice.predictedHeads, 100);
  assert.ok(Math.abs(summary.methods.choice.meanBrier - 0.34) < 1e-10);
  assert.equal(summary.methods.noul.predictedTails, 100);
  assert.ok(Math.abs(summary.methods.noul.meanBrier - 0.34) < 1e-10);
  assert.equal(summary.methods.score.abstained, 100);
  assert.equal(summary.methods.score.meanBrier, 0.25);
});

test('100 three-question calls precede 100 independent flips and produce a v3 trace', async (t) => {
  const parent = mkdtempSync(join(tmpdir(), 'jev-coin-three-'));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const directory = join(parent, 'logs');
  const runs = new Map();
  const started = createRun(directory, 'openrouter', 'test-model', runs);
  const run = runs.get(started.id);
  const numbers = [];
  let flips = 0;
  const options = {
    provider: 'openrouter', model: 'test-model', key: 'test-only-placeholder',
    coinFlip: () => {
      assert.equal(numbers.length, flips + 1);
      flips++;
      return flips % 2 ? 'heads' : 'tails';
    },
    fetchImpl: async (_url, request) => {
      assert.equal(request.headers.Authorization, 'Bearer test-only-placeholder');
      assert.equal(request.body.includes('test-only-placeholder'), false);
      const body = JSON.parse(request.body);
      assert.deepEqual(Object.keys(body.state), ['experiment', 'toss_number']);
      assert.deepEqual(Object.keys(body.questions), ['choice', 'noul', 'score']);
      numbers.push(body.state.toss_number);
      return { ok: true, json: async () => providerAnswers() };
    },
  };
  for (let i = 0; i < 100; i++) await nextToss(directory, run, options);
  assert.deepEqual(numbers, Array.from({ length: 100 }, (_, i) => i + 1));
  assert.equal(flips, 100);
  assert.equal(run.tosses.length, 100);
  const summary = summarizeTosses(run.tosses);
  assert.equal(summary.winner, 'tie');
  assert.equal(summary.methods.choice.correct, 50);
  assert.equal(summary.methods.noul.correct, 50);
  assert.equal(summary.methods.score.abstained, 100);
  await assert.rejects(nextToss(directory, run, options), /complete/);
  const file = join(directory, `${started.id}.jsonl`);
  const events = readFileSync(file, 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(events.length, 102);
  assert.equal(events.filter((event) => event.event === 'toss_completed').length, 100);
  assert.equal(events[0].schemaVersion, 3);
  assert.equal(events[0].protocol, 'jev-three-primitives-crypto-coin-v3');
  assert.equal(events[1].predictions.choice.prediction, 'heads');
  assert.equal(events[1].predictions.noul.prediction, 'tails');
  assert.equal(events[1].predictions.score.prediction, null);
  assert.equal(events[1].request.state.coin_result, undefined);
  assert.deepEqual(events.at(-1).summary, summary);
  assert.equal(readFileSync(file, 'utf8').includes('test-only-placeholder'), false);
  assert.equal(statSync(directory).mode & 0o777, 0o700);
  assert.equal(statSync(file).mode & 0o777, 0o600);
});

test('a missing primitive answer leaves the same toss available without flipping', async (t) => {
  const parent = mkdtempSync(join(tmpdir(), 'jev-coin-three-failure-'));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const directory = join(parent, 'logs');
  const runs = new Map();
  const started = createRun(directory, 'openrouter', 'test-model', runs);
  const run = runs.get(started.id);
  let flips = 0;
  const base = { provider: 'openrouter', model: 'test-model', key: 'test-only-placeholder',
    coinFlip: () => { flips++; return 'heads'; } };
  await assert.rejects(nextToss(directory, run, {
    ...base, fetchImpl: async () => ({ ok: true, json: async () => ({ answers: { choice: providerAnswers().answers.choice } }) }),
  }), /invalid noul/);
  assert.equal(run.tosses.length, 0);
  assert.equal(flips, 0);
  await nextToss(directory, run, {
    ...base, fetchImpl: async () => ({ ok: true, json: async () => providerAnswers() }),
  });
  assert.equal(run.tosses[0].number, 1);
  assert.equal(flips, 1);
  const events = readFileSync(join(directory, `${started.id}.jsonl`), 'utf8').trim().split('\n').map(JSON.parse);
  assert.deepEqual(events.map((event) => event.event), ['run_started', 'toss_failed', 'toss_completed']);
  assert.equal(events[1].errorKind, 'invalid_jev_answer');
});

test('Vercel boolean response is normalized as Noul', async () => {
  let request;
  const answers = providerAnswers().answers;
  answers.noul = { type: 'boolean', probability: 0.6 };
  const result = await callJevToss(1, {
    provider: 'vercel', model: 'typesafe-ai/jev', key: 'test-only-placeholder',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => ({ answers }) };
    },
  });
  assert.equal(request.url, 'https://ai-gateway.vercel.sh/v1/evaluate');
  assert.equal(JSON.parse(request.options.body).questions.noul.type, 'boolean');
  assert.equal(result.noul.prediction, 'heads');
  assert.equal(result.noul.forecastHeads, 0.6);
});
