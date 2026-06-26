import { useState, useCallback } from 'react';
import type { ImageData, BoundingBox } from '../lib/types';

export function useAnnotation() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<BoundingBox[][]>([]);

  const currentImage = images[currentIdx] || null;

  const addBox = useCallback((box: BoundingBox) => {
    setImages((prev) => {
      const copy = [...prev];
      const img = { ...copy[currentIdx] };
      img.boxes = [...img.boxes, box];
      img.annotated = true;
      copy[currentIdx] = img;
      return copy;
    });
  }, [currentIdx]);

  const updateBox = useCallback((id: string, updates: Partial<BoundingBox>) => {
    setImages((prev) => {
      const copy = [...prev];
      const img = { ...copy[currentIdx] };
      img.boxes = img.boxes.map((b) => (b.id === id ? { ...b, ...updates } : b));
      copy[currentIdx] = img;
      return copy;
    });
  }, [currentIdx]);

  const deleteBox = useCallback((id: string) => {
    setImages((prev) => {
      const copy = [...prev];
      const img = { ...copy[currentIdx] };
      img.boxes = img.boxes.filter((b) => b.id !== id);
      copy[currentIdx] = img;
      return copy;
    });
  }, [currentIdx]);

  const acceptAllAbove = useCallback((threshold: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const img = { ...copy[currentIdx] };
      img.boxes = img.boxes.map((b) =>
        b.confidence >= threshold ? { ...b, accepted: true } : b
      );
      copy[currentIdx] = img;
      return copy;
    });
  }, [currentIdx]);

  const navigate = useCallback((dir: 'prev' | 'next') => {
    setCurrentIdx((prev) => {
      if (dir === 'prev') return Math.max(0, prev - 1);
      return Math.min(images.length - 1, prev + 1);
    });
    setSelectedBoxId(null);
  }, [images.length]);

  const addImages = useCallback((imgs: ImageData[]) => {
    setImages((prev) => [...prev, ...imgs]);
  }, []);

  const pushUndo = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-50), [...(currentImage?.boxes || [])]]);
  }, [currentImage]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setImages((imgs) => {
      const copy = [...imgs];
      copy[currentIdx] = { ...copy[currentIdx], boxes: prev };
      return copy;
    });
  }, [undoStack, currentIdx]);

  return {
    images, currentImage, currentIdx, selectedBoxId,
    addBox, updateBox, deleteBox, acceptAllAbove,
    navigate, addImages, setSelectedBoxId, pushUndo, undo,
    setCurrentIdx,
  };
}
