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

    def test_fruit_counting_filters_people_and_converts_banana_boxes(self):
        classes = [{"id": 46, "name": "banana", "key": "bananas", "label": "Bananas"}]
        class Model:
            def infer(self, image):
                return np.array([[20, 30, 50, 40, .8, 46], [0, 0, 50, 50, .9, 0]], dtype=float)
        detections = detect(Model(), np.zeros((720, 1280, 3), dtype=np.uint8), {46: "banana"})
        np.testing.assert_array_equal(detections.class_id, [46])
        np.testing.assert_allclose(detections.xyxy, [[40, 60, 140, 140]])
        self.assertEqual(count_frame(detections, classes), {"bananas": 1})
        self.assertEqual(count_frame(sv.Detections.empty(), classes), {"bananas": 0})

    def test_registered_input_order_preserves_legacy_rgb_and_shop_bgr(self):
        class Model:
            def infer(self, image):
                self.image = image.copy()
                return np.empty((0, 6))
        model = Model()
        frame = np.full((1, 2, 3), [5, 40, 200], dtype=np.uint8)
        detect(model, frame)
        np.testing.assert_array_equal(model.image[0, 0], [200, 40, 5])
        detect(model, frame, input_color="BGR")
        np.testing.assert_array_equal(model.image[0, 0], [5, 40, 200])
        np.testing.assert_array_equal(model.image[400, 0], [114, 114, 114])
        with self.assertRaises(ValueError):
            detect(model, frame, input_color="unknown")

    def test_real_generated_counts_match_saved_detection_rows_per_video(self):
        root = Path(__file__).parent
        registry = json.loads((root / 'videos.json').read_text())
        for video in registry:
            path = root / 'data' / video['id'] / 'analysis.json'
            if not path.exists():
                self.skipTest('Prepare every example for the real-output audit')
            analysis = json.loads(path.read_text())
            self.assertEqual(analysis['schemaVersion'], 4 if video.get('classes') else 3)
            self.assertEqual(analysis['videoId'], video['id'])
            self.assertEqual(analysis['model'].get('inputColor', 'RGB'), video.get('inputColor', 'RGB'))
            self.assertEqual(analysis['video']['frameCount'], video['fps'] * video['source']['durationSeconds'])
            for frame in analysis['frames']:
                rows = frame['detections']
                if video.get('classes'):
                    self.assertEqual(analysis['classes'], video['classes'])
                    for item in video['classes']:
                        self.assertEqual(frame['counts'][item['key']], sum(row['class'] == item['name'] for row in rows))
                else:
                    self.assertEqual(frame['people'], sum(row['class'] == 'person' for row in rows))
                    self.assertEqual(frame['cars'], sum(row['class'] == 'car' for row in rows))
                self.assertTrue(all(row['confidence'] >= .35 for row in rows))


if __name__ == "__main__":
    unittest.main()
