import { Task } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, Bookmark, BarChart3, AlertCircle } from 'lucide-react';

interface TaskStatsProps {
  tasks: Task[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

  const priorityCounts = tasks.reduce(
    (acc, t) => {
      if (!t.completed) acc[t.priority]++;
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

  const categories = Array.from(new Set(tasks.map(t => t.category)))
    .filter(Boolean);

  const overdue = tasks.filter(t => {
    if (t.completed || !t.due_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.due_date < today;
  }).length;

  return (
    <div id="stats-panel" className="bg-neutral-50 border border-neutral-200/50 rounded-2xl p-6 mb-8 text-neutral-800">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-neutral-400" />
        <h3 className="font-mono text-xs tracking-wider uppercase text-neutral-400 font-semibold">
          Performance Curation
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="font-mono text-2xl font-light text-neutral-900 tracking-tight">
            {completed}<span className="text-neutral-300 text-base font-normal"> / {total}</span>
          </div>
          <p className="text-xs text-neutral-400 uppercase font-mono tracking-wider mt-1">Completed</p>
        </div>

        <div>
          <div className="font-mono text-2xl font-light text-neutral-900 tracking-tight">
            {active}
          </div>
          <p className="text-xs text-neutral-400 uppercase font-mono tracking-wider mt-1">Active items</p>
        </div>

        <div>
          <div className="font-mono text-2xl font-light text-neutral-900 tracking-tight flex items-baseline gap-1">
            {percentComplete}%
          </div>
          <p className="text-xs text-neutral-400 uppercase font-mono tracking-wider mt-1">Completion</p>
        </div>

        <div>
          <div className={`font-mono text-2xl font-light tracking-tight flex items-baseline gap-1 ${overdue > 0 ? 'text-rose-600 font-medium' : 'text-neutral-955'}`}>
            {overdue}
          </div>
          <p className="text-xs text-neutral-400 uppercase font-mono tracking-wider mt-1">Overdue date</p>
        </div>
      </div>

      {total > 0 && (
        <div className="mt-6 pt-5 border-t border-neutral-200/40">
          <div className="flex justify-between items-center text-xs font-mono text-neutral-400 mb-2">
            <span>INDEX PROGRESS</span>
            <span>{percentComplete}% Complete</span>
          </div>
          <div className="w-full h-[3px] bg-neutral-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-neutral-900"
            />
          </div>
        </div>
      )}

      {active > 0 && (
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 pt-4 border-t border-neutral-100 font-mono text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            {priorityCounts.high} High priority
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            {priorityCounts.medium} Medium priority
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400"></span>
            {priorityCounts.low} Low priority
          </span>
        </div>
      )}
    </div>
  );
}
