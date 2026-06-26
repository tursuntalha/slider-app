export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  classId: number;
  className: string;
  confidence: number;
  source: 'ai' | 'manual';
}

export interface ImageData {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  boxes: BoundingBox[];
  annotated: boolean;
}

export interface ClassDef {
  id: number;
  name: string;
  color: string;
}

export const COCO_CLASSES: ClassDef[] = [
  { id: 0, name: 'person', color: '#ef4444' },
  { id: 1, name: 'bicycle', color: '#f97316' },
  { id: 2, name: 'car', color: '#eab308' },
  { id: 3, name: 'motorcycle', color: '#22c55e' },
  { id: 4, name: 'airplane', color: '#14b8a6' },
  { id: 5, name: 'bus', color: '#3b82f6' },
  { id: 6, name: 'train', color: '#8b5cf6' },
  { id: 7, name: 'truck', color: '#ec4899' },
  { id: 8, name: 'boat', color: '#6366f1' },
  { id: 9, name: 'traffic light', color: '#84cc16' },
  { id: 10, name: 'fire hydrant', color: '#06b6d4' },
  { id: 11, name: 'stop sign', color: '#d946ef' },
  { id: 12, name: 'parking meter', color: '#f43f5e' },
  { id: 13, name: 'bench', color: '#0ea5e9' },
  { id: 14, name: 'bird', color: '#10b981' },
  { id: 15, name: 'cat', color: '#f59e0b' },
  { id: 16, name: 'dog', color: '#8b5cf6' },
  { id: 17, name: 'horse', color: '#ef4444' },
  { id: 18, name: 'sheep', color: '#22c55e' },
  { id: 19, name: 'cow', color: '#eab308' },
  { id: 20, name: 'elephant', color: '#6366f1' },
  { id: 21, name: 'bear', color: '#ec4899' },
  { id: 22, name: 'zebra', color: '#14b8a6' },
  { id: 23, name: 'giraffe', color: '#f97316' },
  { id: 24, name: 'backpack', color: '#3b82f6' },
  { id: 25, name: 'umbrella', color: '#84cc16' },
  { id: 26, name: 'handbag', color: '#d946ef' },
  { id: 27, name: 'tie', color: '#06b6d4' },
  { id: 28, name: 'suitcase', color: '#f43f5e' },
  { id: 29, name: 'frisbee', color: '#0ea5e9' },
  { id: 30, name: 'skis', color: '#10b981' },
  { id: 31, name: 'snowboard', color: '#f59e0b' },
  { id: 32, name: 'sports ball', color: '#8b5cf6' },
  { id: 33, name: 'kite', color: '#ef4444' },
  { id: 34, name: 'baseball bat', color: '#22c55e' },
  { id: 35, name: 'baseball glove', color: '#eab308' },
  { id: 36, name: 'skateboard', color: '#6366f1' },
  { id: 37, name: 'surfboard', color: '#ec4899' },
  { id: 38, name: 'tennis racket', color: '#14b8a6' },
  { id: 39, name: 'bottle', color: '#f97316' },
  { id: 40, name: 'wine glass', color: '#3b82f6' },
  { id: 41, name: 'cup', color: '#84cc16' },
  { id: 42, name: 'fork', color: '#d946ef' },
  { id: 43, name: 'knife', color: '#06b6d4' },
  { id: 44, name: 'spoon', color: '#f43f5e' },
  { id: 45, name: 'bowl', color: '#0ea5e9' },
  { id: 46, name: 'banana', color: '#10b981' },
  { id: 47, name: 'apple', color: '#f59e0b' },
  { id: 48, name: 'sandwich', color: '#8b5cf6' },
  { id: 49, name: 'orange', color: '#ef4444' },
  { id: 50, name: 'broccoli', color: '#22c55e' },
  { id: 51, name: 'carrot', color: '#eab308' },
  { id: 52, name: 'hot dog', color: '#6366f1' },
  { id: 53, name: 'pizza', color: '#ec4899' },
  { id: 54, name: 'donut', color: '#14b8a6' },
  { id: 55, name: 'cake', color: '#f97316' },
  { id: 56, name: 'chair', color: '#3b82f6' },
  { id: 57, name: 'couch', color: '#84cc16' },
  { id: 58, name: 'potted plant', color: '#d946ef' },
  { id: 59, name: 'bed', color: '#06b6d4' },
  { id: 60, name: 'dining table', color: '#f43f5e' },
  { id: 61, name: 'toilet', color: '#0ea5e9' },
  { id: 62, name: 'tv', color: '#10b981' },
  { id: 63, name: 'laptop', color: '#f59e0b' },
  { id: 64, name: 'mouse', color: '#8b5cf6' },
  { id: 65, name: 'remote', color: '#ef4444' },
  { id: 66, name: 'keyboard', color: '#22c55e' },
  { id: 67, name: 'cell phone', color: '#eab308' },
  { id: 68, name: 'microwave', color: '#6366f1' },
  { id: 69, name: 'oven', color: '#ec4899' },
  { id: 70, name: 'toaster', color: '#14b8a6' },
  { id: 71, name: 'sink', color: '#f97316' },
  { id: 72, name: 'refrigerator', color: '#3b82f6' },
  { id: 73, name: 'book', color: '#84cc16' },
  { id: 74, name: 'clock', color: '#d946ef' },
  { id: 75, name: 'vase', color: '#06b6d4' },
  { id: 76, name: 'scissors', color: '#f43f5e' },
  { id: 77, name: 'teddy bear', color: '#0ea5e9' },
  { id: 78, name: 'hair drier', color: '#10b981' },
  { id: 79, name: 'toothbrush', color: '#f59e0b' },
];

export type ExportFormat = 'yolo' | 'coco' | 'voc';
