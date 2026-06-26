import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, Image as ImageIcon, CheckCircle } from 'lucide-react';
import type { ImageData, ClassDef } from '../lib/types';
import { COCO_CLASSES } from '../lib/types';

interface Props {
  images: ImageData[];
}

export function StatsPanel({ images }: Props) {
  const annotated = images.filter((i) => i.annotated && i.boxes.length > 0);
  const pending = images.length - annotated.length;

  const classCounts = new Map<number, number>();
  images.forEach((img) => img.boxes.forEach((b) => {
    classCounts.set(b.classId, (classCounts.get(b.classId) || 0) + 1);
  }));

  const chartData = Array.from(classCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([id, count]) => {
      const cls = COCO_CLASSES.find((c) => c.id === id);
      return { name: cls?.name || `Class ${id}`, count, color: cls?.color || '#3b82f6' };
    });

  const totalBoxes = images.reduce((sum, img) => sum + img.boxes.length, 0);

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <BarChart3 size={16} />
        İstatistikler
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-400">
            <ImageIcon size={14} />
            <span className="text-xs">Toplam</span>
          </div>
          <p className="text-xl font-bold">{images.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={14} />
            <span className="text-xs">Annotated</span>
          </div>
          <p className="text-xl font-bold">{annotated.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 text-yellow-400">
            <ImageIcon size={14} />
            <span className="text-xs">Pending</span>
          </div>
          <p className="text-xl font-bold">{pending}</p>
        </div>
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-400">
            <BarChart3 size={14} />
            <span className="text-xs">Boxes</span>
          </div>
          <p className="text-xl font-bold">{totalBoxes}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="h-40">
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ left: 70, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--fg)" />
              <YAxis type="category" dataKey="name" stroke="var(--fg)" tick={{ fontSize: 10 }} width={70} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
