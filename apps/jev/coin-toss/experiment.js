export const tossCount = 100;
export const methods = ['choice', 'noul', 'score'];

export function tossQuestions(number, provider) {
  if (!Number.isInteger(number) || number < 1 || number > tossCount) throw new Error('Invalid toss number.');
  if (!['openrouter', 'vercel'].includes(provider)) throw new Error('Invalid Jev provider.');
  return {
    state: {
      experiment: 'A fair software coin will be flipped after these predictions. The two possible outcomes are heads and tails.',
      toss_number: number,
    },
    questions: {
      choice: {
        type: 'choice',
        instructions: 'Predict whether the upcoming independent fair coin flip will land heads or tails.',
        criteria: { heads: 'The coin lands heads.', tails: 'The coin lands tails.' },
      },
      noul: {
        type: provider === 'vercel' ? 'boolean' : 'noul',
        instructions: 'Will the upcoming independent fair coin flip land heads?',
        criteria: { true: 'It lands heads.', false: 'It lands tails.' },
      },
      score: {
        type: 'score',
        instructions: 'Rate the upcoming independent fair coin flip outcome on this two-level scale.',
        criteria: ['The coin lands tails.', 'The coin lands heads.'],
      },
    },
  };
}

function validProbability(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function predictionFrom(signal) {
  return signal > 0.5 ? 'heads' : signal < 0.5 ? 'tails' : null;
}

export function validateTossAnswers(answers, provider) {
  const choice = answers?.choice;
  const heads = choice?.probabilities?.heads;
  const tails = choice?.probabilities?.tails;
  if (!['heads', 'tails'].includes(choice?.choice) || !validProbability(heads) ||
      !validProbability(tails) || Math.abs(heads + tails - 1) > 0.06) {
    throw new Error('Jev returned an invalid choice answer.');
  }
  const noulValue = provider === 'vercel' ? answers?.noul?.probability : answers?.noul?.noul;
  if (!validProbability(noulValue)) throw new Error('Jev returned an invalid noul answer.');
  const score = answers?.score;
  const scoreTails = score?.probabilities?.['0'];
  const scoreHeads = score?.probabilities?.['1'];
  if (!validProbability(score?.score) || !validProbability(scoreTails) ||
      !validProbability(scoreHeads) || Math.abs(scoreTails + scoreHeads - 1) > 0.06) {
    throw new Error('Jev returned an invalid score answer.');
  }
  return {
    choice: { prediction: choice.choice, forecastHeads: heads, probabilities: { heads, tails } },
    noul: { prediction: predictionFrom(noulValue), forecastHeads: noulValue },
    score: {
      prediction: predictionFrom(score.score), position: score.score,
      forecastHeads: scoreHeads,
      probabilities: { tails: scoreTails, heads: scoreHeads },
    },
  };
}

export function summarizeTosses(tosses) {
  const heads = tosses.filter((toss) => toss.outcome === 'heads').length;
  const tails = tosses.filter((toss) => toss.outcome === 'tails').length;
  const comparison = Object.fromEntries(methods.map((method) => {
    const values = tosses.map((toss) => toss.predictions[method]);
    return [method, {
      predictedHeads: values.filter((value) => value.prediction === 'heads').length,
      predictedTails: values.filter((value) => value.prediction === 'tails').length,
      abstained: values.filter((value) => value.prediction === null).length,
      correct: values.filter((value) => value.correct === true).length,
      meanBrier: values.length
        ? tosses.reduce((sum, toss) => sum +
          (toss.predictions[method].forecastHeads - (toss.outcome === 'heads' ? 1 : 0)) ** 2, 0) / values.length : null,
    }];
  }));
  return {
    heads, tails, methods: comparison,
    winner: tosses.length === tossCount ? heads > tails ? 'heads' : tails > heads ? 'tails' : 'tie' : null,
  };
}

export async function callJevToss(number, { provider, model, key, fetchImpl = fetch }) {
  if (!key) throw new Error('Configure a Jev API key to run the experiment.');
  const url = provider === 'openrouter'
    ? 'https://openrouter.ai/api/alpha/decisions'
    : 'https://ai-gateway.vercel.sh/v1/evaluate';
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, ...tossQuestions(number, provider) }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) {
    if (response.status === 402) throw new Error('The provider account has insufficient credits.');
    if (response.status === 401 || response.status === 403) throw new Error('The API key cannot access Jev on this provider.');
    if (response.status === 429) throw new Error('The provider rate limit was reached. Please retry.');
    throw new Error(`The provider returned HTTP ${response.status}.`);
  }
  return validateTossAnswers((await response.json())?.answers, provider);
}
