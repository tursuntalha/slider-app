import { useState } from 'react';
import { Download, Loader2, FileDown } from 'lucide-react';
import type { ImageData, ExportFormat } from '../lib/types';

interface Props {
  images: ImageData[];
}

export function ExportButton({ images }: Props) {
  const [format, setFormat] = useState<ExportFormat>('yolo');
  const [exporting, setExporting] = useState(false);
  const [split, setSplit] = useState(true);

  const generateYOLO = (boxes: ImageData['boxes'], imgW: number, imgH: number): string => {
    return boxes.map((b) => {
      const cx = (b.x + b.w / 2) / imgW;
      const cy = (b.y + b.h / 2) / imgH;
      const w = b.w / imgW;
      const h = b.h / imgH;
      return `${b.classId} ${cx.toFixed(6)} ${cy.toFixed(6)} ${w.toFixed(6)} ${h.toFixed(6)}`;
    }).join('\n');
  };

  const generateCOCO = (imgs: ImageData[]): string => {
    const images = imgs.map((img, i) => ({
      id: i, file_name: img.name, width: img.width, height: img.height,
    }));
    const annotations = imgs.flatMap((img, imgIdx) =>
      img.boxes.map((b, annIdx) => ({
        id: annIdx, image_id: imgIdx,
        category_id: b.classId,
        bbox: [b.x, b.y, b.w, b.h],
        area: b.w * b.h,
        iscrowd: 0,
      }))
    );
    const categories = [...new Set(imgs.flatMap((img) => img.boxes.map((b) => b.classId)))].map((id) => ({
      id, name: imgs.flatMap((i) => i.boxes).find((b) => b.classId === id)?.className || String(id),
    }));
    return JSON.stringify({ images, annotations, categories }, null, 2);
  };

  const generateVOC = (img: ImageData): string => {
    const objects = img.boxes.map((b) => `    <object>
      <name>${b.className}</name>
      <bndbox>
        <xmin>${Math.round(b.x)}</xmin>
        <ymin>${Math.round(b.y)}</ymin>
        <xmax>${Math.round(b.x + b.w)}</xmax>
        <ymax>${Math.round(b.y + b.h)}</ymax>
      </bndbox>
    </object>`).join('\n');

    return `<?xml version="1.0"?>
<annotation>
  <filename>${img.name}</filename>
  <size>
    <width>${img.width}</width>
    <height>${img.height}</height>
  </size>
  ${objects}
</annotation>`;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const annotated = images.filter((img) => img.annotated && img.boxes.length > 0);
      if (annotated.length === 0) { alert('No annotated images'); return; }

      let train: ImageData[], val: ImageData[], test: ImageData[];
      if (split && annotated.length >= 3) {
        const shuffled = [...annotated].sort(() => Math.random() - 0.5);
        const n = shuffled.length;
        train = shuffled.slice(0, Math.floor(n * 0.7));
        val = shuffled.slice(Math.floor(n * 0.7), Math.floor(n * 0.9));
        test = shuffled.slice(Math.floor(n * 0.9));
      } else {
        train = annotated; val = []; test = [];
      }

      const zip = await import('jszip').then((m) => m.default);
      const JSZip = new zip();

      const addImagesToZip = (imgs: ImageData[], prefix: string) => {
        imgs.forEach((img, i) => {
          if (format === 'yolo') {
            JSZip.file(`${prefix}/labels/${img.name.replace(/\.(jpg|jpeg|png|webp)$/i, '.txt')}`, generateYOLO(img.boxes, img.width, img.height));
            // We'd need to fetch the image blob; for now just annotation
          } else if (format === 'coco') {
            // Handled separately
          } else if (format === 'voc') {
            JSZip.file(`${prefix}/annotations/${img.name.replace(/\.(jpg|jpeg|png|webp)$/i, '.xml')}`, generateVOC(img));
          }
        });
      };

      if (format === 'coco') {
        JSZip.file('annotations.json', generateCOCO(annotated));
      } else {
        if (split && train.length) addImagesToZip(train, 'train');
        if (split && val.length) addImagesToZip(val, 'val');
        if (split && test.length) addImagesToZip(test, 'test');
        if (!split) addImagesToZip(annotated, 'all');
      }

      const content = await JSZip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annotations-${format}-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setExporting(false);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as ExportFormat)}
        className="text-xs border border-(--border) rounded-md px-2 py-1.5 bg-(--surface) outline-none"
      >
        <option value="yolo">YOLO .txt</option>
        <option value="coco">COCO JSON</option>
        <option value="voc">Pascal VOC</option>
      </select>
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} />
        Train/Val/Test
      </label>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--primary) text-white text-xs font-medium hover:bg-(--primary-dark) disabled:opacity-50 transition-colors"
      >
        {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        Export
      </button>
    </div>
  );
}
