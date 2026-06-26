# AnnotateAI — AI-Assisted Image Annotation Tool

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-FF6B35?style=for-the-badge&logoColor=white)

> **"Veri etiketlemeyi AI'ye bırak, sen kontrol et."**

A browser-based image annotation tool that uses YOLOv8 to automatically suggest bounding boxes and class labels. You adjust, confirm, and export — dramatically cutting the time needed to build a labeled dataset for custom computer vision models.

---

## The Problem

Every custom computer vision project hits the same wall: you need thousands of labeled images before training can even begin. Manual bounding box annotation is slow (2–5 minutes per image), inconsistent across annotators, and mind-numbing at scale. Existing open-source tools (LabelImg, CVAT) are desktop-only and have no AI assistance built in.

**AnnotateAI solves this by making the AI do the first pass — you just review and correct.**

---

## How It Works

```
Upload Image(s)
      │
      ▼
┌──────────────────────────────┐
│  FastAPI Backend             │
│  YOLOv8 Inference            │
│  → bounding boxes            │
│  → class labels              │
│  → confidence scores         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Confidence Threshold Slider │  Hide boxes below X% confidence
│  IoU Slider                  │  Remove overlapping duplicates
│  Class Filter                │  Show/hide specific classes
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  React Canvas Annotation UI  │
│  → accept / reject boxes     │
│  → draw new boxes            │
│  → reassign class labels     │
└──────────────┬───────────────┘
               │
               ▼
         Export Dataset
   YOLO .txt | COCO JSON | VOC XML
```

---

## The Sliders

The "slider" in AnnotateAI isn't a carousel — it's the core UX paradigm:

| Slider | Range | Effect |
|--------|-------|--------|
| **Confidence Threshold** | 0–100% | Hide AI boxes below this confidence — only show high-certainty suggestions |
| **IoU Threshold** | 0–1.0 | Suppress overlapping boxes (Non-Maximum Suppression strength) |
| **Class Probability** | Per class | Show/hide all boxes of a specific class |

This lets you say: "Only show me boxes where the AI is >70% confident, and suppress overlapping boxes with IoU>0.5."

---

## Export Formats

| Format | File Type | Use Case |
|--------|-----------|---------|
| **YOLO** | `.txt` per image | Train with Ultralytics YOLOv8/v5 |
| **COCO** | Single `annotations.json` | MMDetection, Detectron2, COCO eval |
| **Pascal VOC** | `.xml` per image | TensorFlow Object Detection API |

---

## Features

- Upload images or entire folders (drag-and-drop)
- YOLOv8 auto-annotation: bounding boxes + class labels + confidence scores
- Confidence, IoU, and class sliders for filtering AI suggestions
- Draw custom bounding boxes on HTML5 Canvas
- Multi-class labeling with per-class color coding
- Accept / reject individual AI-suggested boxes
- Dataset statistics panel: class distribution bar chart, total annotations, annotated/pending count
- Keyboard shortcuts: `A`/`D` navigate images, `Delete` removes selected box, `Enter` accepts all
- Export to YOLO, COCO, or Pascal VOC with one click

---

## Architecture

```
┌──────────────────────┐       ┌──────────────────────┐
│  React Frontend      │       │  FastAPI Backend      │
│  TypeScript          │◄─────►│  Python 3.11          │
│  HTML5 Canvas        │  REST │  YOLOv8 (Ultralytics) │
│  Tailwind CSS        │       │  Uvicorn              │
└──────────────────────┘       └──────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, HTML5 Canvas API, Tailwind CSS |
| Backend | FastAPI (Python), Uvicorn |
| AI Model | Ultralytics YOLOv8 (pretrained COCO weights) |
| Communication | REST API (multipart image upload) |

---

## Project Structure

```
slider-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.tsx        # Bounding box drawing + interaction
│   │   │   ├── SliderPanel.tsx   # Confidence, IoU, class sliders
│   │   │   ├── ClassLegend.tsx   # Color-coded class list
│   │   │   └── ExportButton.tsx  # Format selector + download
│   │   ├── hooks/
│   │   │   └── useAnnotation.ts  # Annotation state management
│   │   └── services/
│   │       └── api.ts            # FastAPI client
├── backend/
│   ├── main.py                   # FastAPI app + /infer endpoint
│   ├── yolo_inference.py         # YOLOv8 inference wrapper
│   ├── export/
│   │   ├── yolo.py               # YOLO format exporter
│   │   ├── coco.py               # COCO JSON exporter
│   │   └── voc.py                # Pascal VOC XML exporter
│   └── requirements.txt
└── README.md
```

---

## Roadmap

### Phase 1 — Canvas Annotation UI
- [x] HTML5 Canvas: draw bounding boxes with mouse drag
- [x] Select, move, resize, delete boxes
- [x] Class label picker (dropdown per box)
- [x] Per-class color coding
- [x] Image navigation (prev/next, thumbnail strip)

### Phase 2 — FastAPI Backend + YOLOv8 Inference
- [x] `/infer` endpoint: accept image → return boxes + labels + scores
- [x] YOLOv8 pretrained COCO weights (80 classes)
- [x] Response format: `[{x, y, w, h, class, confidence}]`
- [x] Support: JPG, PNG, WebP
- [x] Batch inference endpoint for folder uploads

### Phase 3 — Confidence Threshold + IoU Sliders
- [x] Confidence slider: filter displayed boxes in real-time (React state)
- [x] IoU slider: client-side NMS to suppress overlapping boxes
- [x] Class visibility toggles
- [x] "Accept all above threshold" button
- [x] Undo/redo stack for box edits

### Phase 4 — Export Pipeline
- [x] YOLO `.txt` export (normalized `class cx cy w h` format)
- [x] COCO JSON export (full annotation schema)
- [x] Pascal VOC XML export
- [x] ZIP download of all annotations + images
- [x] Split options: train/val/test (70/20/10)

### Phase 5 — Dataset Stats Dashboard + Batch Upload
- [x] Class distribution bar chart
- [x] Annotated vs pending image counter
- [x] Images per class table
- [x] Drag-and-drop folder upload
- [x] Progress bar for batch inference
- [x] Custom class list (upload your own instead of COCO defaults)

---

## Getting Started

```bash
# Backend
cd backend
pip install fastapi uvicorn ultralytics pillow
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

> Built by [Talha Tursun](https://github.com/tursuntalha) · Making dataset creation as fast as model training.
