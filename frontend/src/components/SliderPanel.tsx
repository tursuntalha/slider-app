import { SlidersHorizontal, Eye, EyeOff, Check } from 'lucide-react';
import type { ClassDef } from '../lib/types';

interface Props {
  confidence: number;
  iou: number;
  visibleClasses: Set<number>;
  classes: ClassDef[];
  onChangeConfidence: (v: number) => void;
  onChangeIou: (v: number) => void;
  onToggleClass: (id: number) => void;
  onAcceptAll: () => void;
}

export function SliderPanel({
  confidence, iou, visibleClasses, classes,
  onChangeConfidence, onChangeIou, onToggleClass, onAcceptAll,
}: Props) {
  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <SlidersHorizontal size={16} />
        Kontroller
      </div>

      <div>
        <label className="text-xs text-gray-400 flex justify-between">
          <span>Confidence Threshold</span>
          <span>{Math.round(confidence * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={confidence}
          onChange={(e) => onChangeConfidence(parseFloat(e.target.value))}
          className="w-full accent-(--primary)"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 flex justify-between">
          <span>IoU Threshold</span>
          <span>{iou.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={iou}
          onChange={(e) => onChangeIou(parseFloat(e.target.value))}
          className="w-full accent-(--primary)"
        />
      </div>

      <button
        onClick={onAcceptAll}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-(--primary)/20 text-(--primary) text-sm font-medium hover:bg-(--primary)/30 transition-colors"
      >
        <Check size={14} />
        Threshold üstünü kabul et
      </button>

      <div>
        <p className="text-xs text-gray-400 mb-2">Sınıf Filtreleri</p>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {classes.slice(0, 30).map((cls) => (
            <button
              key={cls.id}
              onClick={() => onToggleClass(cls.id)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs hover:bg-(--surface) transition-colors"
            >
              {visibleClasses.has(cls.id) ? <Eye size={12} /> : <EyeOff size={12} />}
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cls.color }} />
              <span className="truncate">{cls.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
