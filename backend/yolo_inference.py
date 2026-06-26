from ultralytics import YOLO
import numpy as np
from PIL import Image

model = None

def get_model():
    global model
    if model is None:
        model = YOLO('yolov8n.pt')
    return model

def infer(image: Image.Image, confidence: float = 0.25, iou: float = 0.45):
    model = get_model()
    results = model(image, conf=confidence, iou=iou)[0]

    boxes = []
    if results.boxes is not None:
        for i, box in enumerate(results.boxes):
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            w = x2 - x1
            h = y2 - y1
            boxes.append({
                "id": f"ai_{i}",
                "x": round(x1, 2),
                "y": round(y1, 2),
                "w": round(w, 2),
                "h": round(h, 2),
                "classId": int(box.cls[0].item()),
                "className": results.names[int(box.cls[0].item())],
                "confidence": round(box.conf[0].item(), 4),
                "source": "ai",
            })

    return {
        "boxes": boxes,
        "width": image.width,
        "height": image.height,
    }
