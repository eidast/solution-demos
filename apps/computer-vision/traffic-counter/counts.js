export function frameAtTime(analysis, mediaTime) {
  if (!Number.isFinite(mediaTime) || !analysis?.frames?.length || !(analysis.video?.fps > 0)) return null;
  const index = Math.min(analysis.frames.length - 1, Math.max(0, Math.floor(mediaTime * analysis.video.fps + 1e-5)));
  return analysis.frames[index];
}

export function validateAnalysis(analysis, videoId, classes, inputColor = 'RGB') {
  const video = analysis?.video;
  const supported = analysis?.schemaVersion === 3 ? !classes : analysis?.schemaVersion === 4 && Array.isArray(classes) && classes.length > 0 && JSON.stringify(analysis.classes) === JSON.stringify(classes) && (analysis.model?.inputColor || 'RGB') === inputColor;
  return supported && typeof analysis.videoId === 'string' && (!videoId || analysis.videoId === videoId) && analysis.mode === 'local-inference-replay' &&
    Number.isFinite(video?.fps) && video.fps > 0 && Number.isInteger(video.frameCount) && video.frameCount > 0 &&
    Array.isArray(analysis.frames) && analysis.frames.length === video.frameCount &&
    analysis.frames.every((frame, index) => frame.frame === index &&
      (analysis.schemaVersion === 3
        ? Number.isSafeInteger(frame.people) && frame.people >= 0 && Number.isSafeInteger(frame.cars) && frame.cars >= 0
        : frame.counts && Object.keys(frame.counts).length === classes.length && classes.every((item) => Number.isSafeInteger(frame.counts[item.key]) && frame.counts[item.key] >= 0)));
}
