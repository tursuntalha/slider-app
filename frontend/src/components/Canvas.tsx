import { useRef, useEffect, useState, useCallback, KeyboardEvent } from 'react';
import type { ImageData, BoundingBox, ClassDef } from '../lib/types';
import { COCO_CLASSES } from '../lib/types';

interface Props {
  image: ImageData | null;
  confidenceThreshold: number;
  iouThreshold: number;
  visibleClasses: Set<number>;
  selectedBoxId: string | null;
  onSelectBox: (id: string | null) => void;
  onAddBox: (box: BoundingBox) => void;
  onUpdateBox: (id: string, updates: Partial<BoundingBox>) => void;
  onDeleteBox: (id: string) => void;
  onPushUndo: () => void;
  currentClass: ClassDef;
}

export function Canvas({
  image, confidenceThreshold, iouThreshold, visibleClasses,
  selectedBoxId, onSelectBox, onAddBox, onUpdateBox, onDeleteBox,
  onPushUndo, currentClass,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, bx: 0, by: 0 });

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const filterBoxes = useCallback((boxes: BoundingBox[]): BoundingBox[] => {
    return boxes.filter((b) => {
      if (b.confidence < confidenceThreshold) return false;
      if (!visibleClasses.has(b.classId)) return false;
      return true;
    });
  }, [confidenceThreshold, visibleClasses]);

  const applyNMS = useCallback((boxes: BoundingBox[]): BoundingBox[] => {
    const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence);
    const result: BoundingBox[] = [];
    for (const box of sorted) {
      let overlap = false;
      for (const kept of result) {
        const ix = Math.max(box.x, kept.x);
        const iy = Math.max(box.y, kept.y);
        const iw = Math.min(box.x + box.w, kept.x + kept.w) - ix;
        const ih = Math.min(box.y + box.h, kept.y + kept.h) - iy;
        if (iw > 0 && ih > 0) {
          const inter = iw * ih;
          const union = box.w * box.h + kept.w * kept.h - inter;
          if (inter / union > iouThreshold) { overlap = true; break; }
        }
      }
      if (!overlap) result.push(box);
    }
    return result;
  }, [iouThreshold]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d')!;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      let boxes = filterBoxes(image.boxes);
      boxes = applyNMS(boxes);

      for (const box of boxes) {
        const cls = COCO_CLASSES.find((c) => c.id === box.classId) || COCO_CLASSES[0];
        const isSelected = box.id === selectedBoxId;
        ctx.strokeStyle = cls.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeRect(box.x, box.y, box.w, box.h);

        ctx.fillStyle = cls.color + '40';
        ctx.fillRect(box.x, box.y, box.w, box.h);

        ctx.fillStyle = cls.color;
        ctx.font = '12px Inter, system-ui, sans-serif';
        const label = `${cls.name} ${Math.round(box.confidence * 100)}%`;
        ctx.fillText(label, box.x + 4, box.y - 4);

        if (isSelected) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(box.x, box.y, box.w, box.h);
          ctx.setLineDash([]);
          // Draw handles
          const handles = [
            { x: box.x, y: box.y },
            { x: box.x + box.w, y: box.y },
            { x: box.x, y: box.y + box.h },
            { x: box.x + box.w, y: box.y + box.h },
          ];
          for (const h of handles) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = cls.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(h.x, h.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }
      }
    };
    img.src = image.url;
  }, [image, selectedBoxId, filterBoxes, applyNMS]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;
    const pos = getPos(e);

    // Check if clicking on existing box
    const clickedBox = [...image.boxes].reverse().find((b) => {
      return pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h;
    });

    if (clickedBox) {
      onSelectBox(clickedBox.id);
      // Check if near edge for resize
      const edgeMargin = 10;
      const nearEdge = (
        Math.abs(pos.x - clickedBox.x) < edgeMargin ||
        Math.abs(pos.x - (clickedBox.x + clickedBox.w)) < edgeMargin ||
        Math.abs(pos.y - clickedBox.y) < edgeMargin ||
        Math.abs(pos.y - (clickedBox.y + clickedBox.h)) < edgeMargin
      );
      if (nearEdge) {
        setResizing(true);
      } else {
        setDragging(true);
        dragStartRef.current = { x: pos.x, y: pos.y, bx: clickedBox.x, by: clickedBox.y };
      }
      return;
    }

    onSelectBox(null);
    setDrawing(true);
    setStartPos(pos);
    onPushUndo();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;
    const pos = getPos(e);

    if (drawing) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      img.src = image.url;
      ctx.drawImage(img, 0, 0);

      ctx.strokeStyle = currentClass.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      ctx.setLineDash([]);
    }

    if (dragging && selectedBoxId) {
      const dx = pos.x - dragStartRef.current.x;
      const dy = pos.y - dragStartRef.current.y;
      onUpdateBox(selectedBoxId, {
        x: dragStartRef.current.bx + dx,
        y: dragStartRef.current.by + dy,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawing && image) {
      const pos = getPos(e);
      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const w = Math.abs(pos.x - startPos.x);
      const h = Math.abs(pos.y - startPos.y);

      if (w > 5 && h > 5) {
        const newBox: BoundingBox = {
          id: 'box_' + Date.now(),
          x, y, w, h,
          classId: currentClass.id,
          className: currentClass.name,
          confidence: 1,
          source: 'manual',
        };
        onAddBox(newBox);
      }
    }
    setDrawing(false);
    setDragging(false);
    setResizing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedBoxId) {
        onDeleteBox(selectedBoxId);
        onSelectBox(null);
      }
    }
  };

  if (!image) {
    return (
      <div className="flex items-center justify-center h-full bg-(--surface) rounded-xl border border-dashed border-(--border)">
        <p className="text-gray-500">Görsel yüklemek için tıklayın veya sürükleyin</p>
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="overflow-auto rounded-xl border border-(--border) bg-(--surface) focus:outline-none"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="block"
      />
    </div>
  );
}
