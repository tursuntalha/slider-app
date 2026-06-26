import { useState, useCallback, useEffect } from 'react';
import {
  Upload, ChevronLeft, ChevronRight, Undo2, Image as ImageIcon,
} from 'lucide-react';
import { Canvas } from './components/Canvas';
import { SliderPanel } from './components/SliderPanel';
import { ExportButton } from './components/ExportButton';
import { StatsPanel } from './components/StatsPanel';
import { useAnnotation } from './hooks/useAnnotation';
import { inferImage } from './services/api';
import { COCO_CLASSES } from './lib/types';
import type { ClassDef, ImageData } from './lib/types';

export default function App() {
  const {
    images, currentImage, currentIdx, selectedBoxId,
    addBox, updateBox, deleteBox, acceptAllAbove,
    navigate, addImages, setSelectedBoxId, pushUndo, undo,
    setCurrentIdx,
  } = useAnnotation();

  const [confidence, setConfidence] = useState(0.25);
  const [iou, setIou] = useState(0.45);
  const [visibleClasses, setVisibleClasses] = useState<Set<number>>(
    new Set(COCO_CLASSES.map((c) => c.id))
  );
  const [currentClass, setCurrentClass] = useState<ClassDef>(COCO_CLASSES[0]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [customClasses, setCustomClasses] = useState<ClassDef[]>(COCO_CLASSES);
  const [showStats, setShowStats] = useState(false);

  const handleFileUpload = useCallback(async (files: FileList) => {
    setUploading(true);
    const fileArr = Array.from(files).filter((f) =>
      /\.(jpg|jpeg|png|webp)$/i.test(f.name)
    );

    const newImages: ImageData[] = [];

    for (let i = 0; i < fileArr.length; i++) {
      setUploadProgress(Math.round((i / fileArr.length) * 100));
      const file = fileArr[i];

      try {
        const result = await inferImage(file, confidence, iou);
        const url = URL.createObjectURL(file);
        newImages.push({
          id: 'img_' + Date.now() + '_' + i,
          name: file.name,
          url,
          width: result.width,
          height: result.height,
          boxes: result.boxes.map((b: any) => ({ ...b, id: 'ai_' + Math.random().toString(36).slice(2, 8), source: 'ai' })),
          annotated: false,
        });
      } catch {
        // Fallback: load image without AI
        const url = URL.createObjectURL(file);
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.src = url;
        });
        newImages.push({
          id: 'img_' + Date.now() + '_' + i,
          name: file.name,
          url,
          width: img.width,
          height: img.height,
          boxes: [],
          annotated: false,
        });
      }
    }

    addImages(newImages);
    setUploadProgress(100);
    setTimeout(() => setUploading(false), 500);
  }, [addImages, confidence, iou]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleFolderUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    input.accept = '.jpg,.jpeg,.png,.webp';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) handleFileUpload(files);
    };
    input.click();
  }, [handleFileUpload]);

  const toggleClassVisibility = useCallback((id: number) => {
    setVisibleClasses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') navigate('prev');
      if (e.key === 'd' || e.key === 'D') navigate('next');
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate, undo]);

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-(--border) bg-(--surface) px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">
            Annotate<span className="text-(--primary)">AI</span>
          </h1>
          <span className="text-xs text-gray-500">
            {images.length > 0 ? `${currentIdx + 1} / ${images.length}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton images={images} />
          <button
            onClick={() => setShowStats((s) => !s)}
            className="p-2 rounded-lg hover:bg-(--border) transition-colors"
            title="Stats"
          >
            <ImageIcon size={16} />
          </button>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--primary) text-white text-xs font-medium cursor-pointer hover:bg-(--primary-dark) transition-colors"
          >
            <Upload size={14} />
            Upload
          </label>
          <button
            onClick={handleFolderUpload}
            className="px-3 py-1.5 rounded-lg border border-(--border) text-xs hover:bg-(--border) transition-colors"
          >
            Folder
          </button>
        </div>
      </header>

      {uploading && (
        <div className="h-1 bg-(--border)">
          <div
            className="h-full bg-(--primary) transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {showStats && images.length > 0 && (
          <div className="w-64 border-r border-(--border) overflow-y-auto">
            <StatsPanel images={images} />
          </div>
        )}

        <div className="flex-1 flex">
          <div
            className="flex-1 p-4 flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {images.length === 0 ? (
              <div
                className="flex-1 flex items-center justify-center border-2 border-dashed border-(--border) rounded-xl"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <Upload size={48} className="mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400 mb-2">Görsel yüklemek için tıklayın veya sürükleyin</p>
                  <p className="text-xs text-gray-500">JPG, PNG, WebP desteklenir</p>
                </div>
              </div>
            ) : (
              <>
                <Canvas
                  image={currentImage}
                  confidenceThreshold={confidence}
                  iouThreshold={iou}
                  visibleClasses={visibleClasses}
                  selectedBoxId={selectedBoxId}
                  onSelectBox={setSelectedBoxId}
                  onAddBox={addBox}
                  onUpdateBox={updateBox}
                  onDeleteBox={deleteBox}
                  onPushUndo={pushUndo}
                  currentClass={currentClass}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('prev')}
                      disabled={currentIdx === 0}
                      className="p-1.5 rounded-lg hover:bg-(--border) disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-gray-500">
                      {currentIdx + 1} / {images.length}
                    </span>
                    <button
                      onClick={() => navigate('next')}
                      disabled={currentIdx >= images.length - 1}
                      className="p-1.5 rounded-lg hover:bg-(--border) disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={undo}
                      className="p-1.5 rounded-lg hover:bg-(--border) transition-colors"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Class:</span>
                    <select
                      value={currentClass.id}
                      onChange={(e) => {
                        const cls = customClasses.find((c) => c.id === parseInt(e.target.value));
                        if (cls) setCurrentClass(cls);
                      }}
                      className="text-xs border border-(--border) rounded-md px-2 py-1 bg-(--surface) outline-none"
                    >
                      {customClasses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {images.length > 0 && (
            <div className="w-60 border-l border-(--border) overflow-y-auto">
              <SliderPanel
                confidence={confidence}
                iou={iou}
                visibleClasses={visibleClasses}
                classes={customClasses}
                onChangeConfidence={setConfidence}
                onChangeIou={setIou}
                onToggleClass={toggleClassVisibility}
                onAcceptAll={() => acceptAllAbove(confidence)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
