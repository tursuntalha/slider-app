import type { BoundingBox } from '../lib/types';

const API = '/api';

export async function inferImage(
  file: File,
  confidence: number = 0.25,
  iou: number = 0.45
): Promise<{ boxes: BoundingBox[]; width: number; height: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confidence', confidence.toString());
  formData.append('iou', iou.toString());

  const res = await fetch(`${API}/infer`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Inference failed');
  return res.json();
}

export async function inferBatch(files: File[]): Promise<{
  results: { name: string; boxes: BoundingBox[]; width: number; height: number }[];
}> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  const res = await fetch(`${API}/infer-batch`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Batch inference failed');
  return res.json();
}
