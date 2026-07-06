from ultralytics import YOLO
import sys

model = YOLO('yolov8n.pt')
model.predict(source='cam1.mp4', save=True, project='/app', name='out1')
model.predict(source='cam2.mp4', save=True, project='/app', name='out2')
