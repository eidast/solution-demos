export function frameAtTime(analysis, mediaTime) {
  if (!Number.isFinite(mediaTime) || !analysis?.frames?.length || !(analysis.video?.fps > 0)) return null;
  const index = Math.min(analysis.frames.length - 1, Math.max(0, Math.floor(mediaTime * analysis.video.fps + 1e-5)));
  return analysis.frames[index];
}

export function validateAnalysis(analysis, videoId) {
  const video = analysis?.video;
  return analysis?.schemaVersion === 3 && typeof analysis.videoId === 'string' && (!videoId || analysis.videoId === videoId) && analysis.mode === 'local-inference-replay' &&
    Number.isFinite(video?.fps) && video.fps > 0 && Number.isInteger(video.frameCount) && video.frameCount > 0 &&
    Array.isArray(analysis.frames) && analysis.frames.length === video.frameCount &&
    analysis.frames.every((frame, index) => frame.frame === index &&
      Number.isSafeInteger(frame.people) && frame.people >= 0 && Number.isSafeInteger(frame.cars) && frame.cars >= 0);
}
