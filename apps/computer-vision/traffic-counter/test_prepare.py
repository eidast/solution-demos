"""Small regression checks for count semantics and detector coordinate conversion."""

import json
from pathlib import Path
import unittest

import numpy as np
import supervision as sv

from prepare import count_frame, detect


class CountingTests(unittest.TestCase):
    def test_only_people_and_cars_are_counted_in_each_frame(self):
        detections = sv.Detections(xyxy=np.array([[0, 0, 10, 10]] * 5, dtype=float), class_id=np.array([0, 0, 2, 5, 7]))
        self.assertEqual(count_frame(detections), {"people": 2, "cars": 1})
        self.assertEqual(count_frame(sv.Detections.empty()), {"people": 0, "cars": 0})

    def test_letterbox_conversion_filters_other_classes_and_clips_boxes(self):
        class Model:
            def infer(self, image):
                self.shape = image.shape
                return np.array([[10, 20, 100, 50, .8, 0], [600, 300, 100, 200, .9, 2], [0, 0, 640, 360, .99, 5]], dtype=float)
        model = Model()
        detections = detect(model, np.zeros((720, 1280, 3), dtype=np.uint8))
        np.testing.assert_array_equal(detections.class_id, [0, 2])
        np.testing.assert_allclose(detections.xyxy, [[20, 40, 220, 140], [1200, 600, 1280, 720]])
        self.assertEqual(model.shape, (640, 640, 3))

    def test_real_generated_counts_match_saved_detection_rows_per_video(self):
        root = Path(__file__).parent
        registry = json.loads((root / 'videos.json').read_text())
        for video in registry:
            path = root / 'data' / video['id'] / 'analysis.json'
            if not path.exists():
                self.skipTest('Prepare every example for the real-output audit')
            analysis = json.loads(path.read_text())
            self.assertEqual(analysis['schemaVersion'], 3)
            self.assertEqual(analysis['videoId'], video['id'])
            self.assertEqual(analysis['video']['frameCount'], video['fps'] * video['source']['durationSeconds'])
            for frame in analysis['frames']:
                rows = frame['detections']
                self.assertEqual(frame['people'], sum(row['class'] == 'person' for row in rows))
                self.assertEqual(frame['cars'], sum(row['class'] == 'car' for row in rows))
                self.assertTrue(all(row['confidence'] >= .35 for row in rows))


if __name__ == "__main__":
    unittest.main()
