import { randomInt, randomUUID } from 'node:crypto';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { callJevToss, methods, summarizeTosses, tossCount, tossQuestions } from './experiment.js';

export class CoinTossError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

const protocol = 'jev-three-primitives-crypto-coin-v3';

export function fairCoinFlip() {
  return randomInt(2) === 0 ? 'heads' : 'tails';
}

function appendEvent(directory, id, event) {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  appendFileSync(join(directory, `${id}.jsonl`), `${JSON.stringify({
    schemaVersion: 3, at: new Date().toISOString(), runId: id, ...event,
  })}\n`, { encoding: 'utf8', mode: 0o600 });
}

export function publicRun(run) {
  return {
    id: run.id, provider: run.provider, model: run.model, protocol,
    target: tossCount, completed: run.tosses.length,
    tosses: run.tosses.map((toss) => ({
      ...toss,
      predictions: Object.fromEntries(methods.map((method) => [method, {
        ...toss.predictions[method],
        ...(toss.predictions[method].probabilities
          ? { probabilities: { ...toss.predictions[method].probabilities } } : {}),
      }])),
    })),
    summary: summarizeTosses(run.tosses),
  };
}

export function createRun(directory, provider, model, runs) {
  const run = { id: randomUUID(), provider, model, tosses: [], pending: false };
  appendEvent(directory, run.id, {
    event: 'run_started', provider, model, protocol, target: tossCount,
    coinSource: 'node:crypto.randomInt(2)',
  });
  runs.set(run.id, run);
  return publicRun(run);
}

function failureKind(error) {
  if (error.name === 'TimeoutError') return 'timeout';
  if (error.message.startsWith('Jev returned an invalid')) return 'invalid_jev_answer';
  if (error.message.startsWith('The provider account')) return 'insufficient_credits';
  if (error.message.startsWith('The API key cannot')) return 'access_denied';
  if (error.message.startsWith('The provider rate limit')) return 'rate_limited';
  if (error.message.startsWith('The provider returned HTTP')) return 'provider_http_error';
  return 'upstream_failure';
}

export async function nextToss(directory, run, options) {
  if (!run) throw new CoinTossError('Run not found.', 404);
  if (run.pending) throw new CoinTossError('A toss is already in progress.', 409);
  if (run.tosses.length >= tossCount) throw new CoinTossError('This run is complete.', 409);
  run.pending = true;
  const number = run.tosses.length + 1;
  const started = performance.now();
  try {
    const answers = await callJevToss(number, options);
    const outcome = (options.coinFlip || fairCoinFlip)();
    if (outcome !== 'heads' && outcome !== 'tails') throw new Error('Invalid coin outcome.');
    const predictions = Object.fromEntries(methods.map((method) => [method, {
      ...answers[method],
      correct: answers[method].prediction === null ? null : answers[method].prediction === outcome,
      brier: (answers[method].forecastHeads - (outcome === 'heads' ? 1 : 0)) ** 2,
    }]));
    const toss = {
      number, outcome, predictions,
      durationMs: Math.round(performance.now() - started),
    };
    appendEvent(directory, run.id, { event: 'toss_completed', ...toss, request: tossQuestions(number, options.provider) });
    run.tosses.push(toss);
    if (number === tossCount) appendEvent(directory, run.id, { event: 'run_completed', summary: summarizeTosses(run.tosses) });
    return publicRun(run);
  } catch (error) {
    appendEvent(directory, run.id, {
      event: 'toss_failed', number, durationMs: Math.round(performance.now() - started),
      request: tossQuestions(number, options.provider), errorKind: failureKind(error),
    });
    throw error;
  } finally {
    run.pending = false;
  }
}
