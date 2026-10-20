"""Prepare or analyze the fixed licensed example locally; no arbitrary media inputs."""

import argparse
import hashlib
import json
import os
from datetime import datetime, UTC
from pathlib import Path
import shutil
import subprocess
import tempfile
import time
import urllib.request

import cv2
import numpy as np
import supervision as sv

from third_party.yolox import YoloX

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / ".cache"
VIDEOS = json.loads((ROOT / "videos.json").read_text())
VIDEO = next(video for video in VIDEOS if video['id'] == 'shibuya')
SOURCE = VIDEO['source']
DATA = ROOT / "data" / VIDEO['id']
FPS, WIDTH, HEIGHT = VIDEO['fps'], VIDEO['width'], VIDEO['height']
THRESHOLD = 0.35
CLASS_NAMES = {0: "person", 2: "car"}
MODEL_URL = "https://media.githubusercontent.com/media/opencv/opencv_zoo/47534e27c9851bb1128ccc0102f1145e27f23f98/models/object_detection_yolox/object_detection_yolox_2022nov.onnx"
MODEL_HASH = "c5c2d13e59ae883e6af3b45daea64af4833a4951c92d116ec270d9ddbe998063"


def digest(path):
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def acquire(path, url, expected):
    if not path.exists():
        print(f"Downloading {path.name}…", flush=True)
        temporary = path.with_suffix(".download")
        request = urllib.request.Request(url, headers={"User-Agent": "SolutionDemos/0.1 (local licensed video example)"})
        try:
            with urllib.request.urlopen(request, timeout=90) as response, temporary.open("wb") as output:
                shutil.copyfileobj(response, output)
            if digest(temporary) != expected:
                raise ValueError(f"Checksum mismatch for {path.name}; download was not accepted.")
            temporary.replace(path)
        finally:
            temporary.unlink(missing_ok=True)
    if digest(path) != expected:
        raise ValueError(f"Checksum mismatch for cached {path.name}; remove it and retry.")


def detect(model, frame):
    """Adapt the Zoo model's RGB, top-left letterbox and xywh output to Supervision."""
    height, width = frame.shape[:2]
    scale = min(640 / width, 640 / height)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    padded = np.full((640, 640, 3), 114, dtype=np.float32)
    resized = cv2.resize(rgb, (int(width * scale), int(height * scale)))
    padded[:resized.shape[0], :resized.shape[1]] = resized
    predictions = model.infer(padded)
    if not len(predictions):
        return sv.Detections.empty()
    predictions = predictions[np.isin(predictions[:, 5].astype(int), list(CLASS_NAMES))]
    if not len(predictions):
        return sv.Detections.empty()
    xyxy = predictions[:, :4].copy() / scale
    xyxy[:, 2:] += xyxy[:, :2]
    xyxy[:, [0, 2]] = np.clip(xyxy[:, [0, 2]], 0, width)
    xyxy[:, [1, 3]] = np.clip(xyxy[:, [1, 3]], 0, height)
    valid = (xyxy[:, 2] > xyxy[:, 0]) & (xyxy[:, 3] > xyxy[:, 1])
    return sv.Detections(xyxy=xyxy[valid], confidence=predictions[valid, 4], class_id=predictions[valid, 5].astype(int))


def count_frame(detections):
    ids = detections.class_id if detections.class_id is not None else np.array([])
    return {"people": int(np.sum(ids == 0)), "cars": int(np.sum(ids == 2))}


def ffmpeg(*arguments):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *map(str, arguments)], check=True)


def progress(stage, completed=0):
    print(json.dumps({"stage": stage, "completed": completed, "total": FPS * SOURCE["durationSeconds"]}), flush=True)


def draw_hud(frame, counts, frame_index):
    """Burn the current-frame HUD into results so it remains visible in fullscreen."""
    overlay = frame.copy()
    cv2.rectangle(overlay, (16, 16), (365, 122), (30, 24, 17), -1)
    cv2.addWeighted(overlay, 0.88, frame, 0.12, 0, frame)
    cv2.line(frame, (188, 51), (188, 108), (82, 73, 61), 1)
    cv2.putText(frame, f"VISION HUD   {frame_index / FPS:05.2f}s / {SOURCE['durationSeconds']}s", (30, 39), cv2.FONT_HERSHEY_SIMPLEX, .48, (205, 215, 220), 1)
    for x, name, value, color in [(30, "PEOPLE", counts['people'], (194, 215, 130)), (208, "CARS", counts['cars'], (120, 188, 255))]:
        cv2.putText(frame, name, (x, 65), cv2.FONT_HERSHEY_SIMPLEX, .43, (205, 215, 220), 1)
        cv2.putText(frame, str(value), (x, 106), cv2.FONT_HERSHEY_SIMPLEX, 1.15, color, 2)
    return frame


def prepare_source():
    source = CACHE / VIDEO['cacheFile']
    acquire(source, SOURCE["url"], SOURCE["sha256"])
    acquire(CACHE / "yolox-s.onnx", MODEL_URL, MODEL_HASH)
    with tempfile.TemporaryDirectory(dir=CACHE) as temporary:
        output = Path(temporary) / "source.mp4"
        ffmpeg("-ss", SOURCE["startSeconds"], "-i", source, "-t", SOURCE["durationSeconds"], "-an", "-vf", f"scale={WIDTH}:{HEIGHT},fps={FPS}", "-c:v", "libx264", "-crf", 20, "-pix_fmt", "yuv420p", "-movflags", "+faststart", output)
        manifest = {"source": SOURCE, "sha256": digest(output)}
        for name in ["analysis.json", "annotated.mp4"]:
            (DATA / name).unlink(missing_ok=True)
        os.replace(output, DATA / "source.mp4")
        (DATA / "prepared-source.json").write_text(json.dumps(manifest) + "\n")
    progress("source-ready")


def analyze():
    source = DATA / "source.mp4"
    manifest = json.loads((DATA / "prepared-source.json").read_text())
    if manifest['source'] != SOURCE or digest(source) != manifest['sha256']:
        raise ValueError("The prepared source does not match the fixed example. Prepare the source again.")
    weights = CACHE / "yolox-s.onnx"
    if not weights.exists() or digest(weights) != MODEL_HASH:
        raise ValueError("The fixed detector weights are missing or invalid. Prepare the source again.")
    cv2.setNumThreads(4)
    model = YoloX(str(weights), confThreshold=THRESHOLD, nmsThreshold=0.5)
    palette = sv.ColorPalette.from_hex(["#82d7c2", "#c6cdd4", "#ffbc78"])
    boxes = sv.BoxAnnotator(color=palette, thickness=2)
    labels = sv.LabelAnnotator(color=palette, text_scale=0.4, text_thickness=1)
    started = time.monotonic()
    frames = []
    progress("analyzing")
    with tempfile.TemporaryDirectory(dir=CACHE) as temporary:
        work = Path(temporary)
        capture = cv2.VideoCapture(str(source))
        writer = cv2.VideoWriter(str(work / "working.mp4"), cv2.VideoWriter_fourcc(*"mp4v"), FPS, (WIDTH, HEIGHT))
        if not capture.isOpened() or not writer.isOpened():
            raise RuntimeError("Could not open the local video decoder or encoder.")
        try:
            while True:
                ok, frame = capture.read()
                if not ok:
                    break
                detections = detect(model, frame)
                counts = count_frame(detections)
                rows = [{"class": CLASS_NAMES[int(kind)], "confidence": round(float(score), 5), "xyxy": np.round(box, 2).tolist()} for box, score, kind in zip(detections.xyxy, detections.confidence if len(detections) else [], detections.class_id if len(detections) else [])]
                frames.append({"frame": len(frames), "time": len(frames) / FPS, **counts, "detections": rows})
                annotated = boxes.annotate(frame.copy(), detections=detections)
                annotated = labels.annotate(annotated, detections=detections, labels=[f"{row['class']} {row['confidence']:.0%}" for row in rows])
                writer.write(draw_hud(annotated, counts, len(frames) - 1))
                if len(frames) % 12 == 0:
                    progress("analyzing", len(frames))
        finally:
            capture.release()
            writer.release()
        expected = FPS * SOURCE["durationSeconds"]
        if len(frames) != expected:
            raise RuntimeError(f"Expected {expected} frames, decoded {len(frames)}; outputs were not published.")
        progress("encoding", len(frames))
        ffmpeg("-i", work / "working.mp4", "-an", "-c:v", "libx264", "-crf", 20, "-pix_fmt", "yuv420p", "-movflags", "+faststart", work / "annotated.mp4")
        analysis = {
            "schemaVersion": 3, "videoId": VIDEO['id'], "mode": "local-inference-replay", "generatedAt": datetime.now(UTC).isoformat(), "source": SOURCE,
            "model": {"name": "YOLOX-S (OpenCV Zoo, 2022nov)", "url": MODEL_URL, "sha256": MODEL_HASH, "license": "Apache-2.0", "confidenceThreshold": THRESHOLD, "nmsIouThreshold": 0.5},
            "runtime": {"supervision": sv.__version__, "opencv": cv2.__version__, "numpy": np.__version__},
            "video": {"fps": FPS, "width": WIDTH, "height": HEIGHT, "frameCount": len(frames), "duration": len(frames) / FPS},
            "countDefinition": "Accepted person and car detections in the current frame; not unique objects or cumulative traffic. Cars exclude bus, truck, bicycle, and motorcycle classes.",
            "processingSeconds": round(time.monotonic() - started, 2),
            "outputs": {"source.mp4": {"sha256": manifest['sha256']}, "annotated.mp4": {"sha256": digest(work / "annotated.mp4")}},
            "frames": frames,
        }
        (work / "analysis.json").write_text(json.dumps(analysis, separators=(",", ":")) + "\n")
        for name in ["annotated.mp4", "analysis.json"]:
            os.replace(work / name, DATA / name)
    progress("ready", len(frames))


def main():
    global VIDEO, SOURCE, DATA, FPS, WIDTH, HEIGHT
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--source-only", action="store_true", help="Prepare clean video and cached weights without inference")
    mode.add_argument("--analyze", action="store_true", help="Analyze the fixed prepared video without downloading anything")
    parser.add_argument("--video", choices=[video['id'] for video in VIDEOS], default="shibuya")
    parser.add_argument("--all", action="store_true", help="Prepare or analyze each registered example without replacing others")
    args = parser.parse_args()
    if not shutil.which("ffmpeg"):
        raise SystemExit("FFmpeg is required. Install it before preparing the example.")
    CACHE.mkdir(exist_ok=True)
    for selected in VIDEOS if args.all else [next(video for video in VIDEOS if video['id'] == args.video)]:
        VIDEO, SOURCE = selected, selected['source']
        FPS, WIDTH, HEIGHT = selected['fps'], selected['width'], selected['height']
        DATA = ROOT / "data" / selected['id']
        DATA.mkdir(parents=True, exist_ok=True)
        if not args.analyze:
            prepare_source()
        if not args.source_only:
            analyze()


if __name__ == "__main__":
    main()
