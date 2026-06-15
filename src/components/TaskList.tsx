import React, { useState } from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  Check, 
  X, 
  AlertTriangle,
  FolderOpen,
  Filter,
  ArrowUpDown,
  Search,
  Sparkles,
  Edit2
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: { text: string; priority: 'low' | 'medium' | 'high'; category: string; due_date: string | null; notes: string | null }) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskList({ tasks, onAddTask, onUpdateTask, onDeleteTask }: TaskListProps) {
  // Task input states
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('Personal');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCat, setShowCustomCategory] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isOpenAddForm, setIsOpenAddForm] = useState(false);

  // Search, filter, and sorting states
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'high-priority'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'priority'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingIdText] = useState('');
  const [editingNotes, setEditingNotes] = useState('');

  // Extract all categories of tasks for filtering
  const allCategories = ['all', ...Array.from(new Set(tasks.map(t => t.category).filter(Boolean)))];

  // Priorities weight for sorting
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  // Filter tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchSearch = task.text.toLowerCase().includes(search.toLowerCase()) || 
        (task.notes && task.notes.toLowerCase().includes(search.toLowerCase()));
      
      const matchFilter = 
        filter === 'all' ? true :
        filter === 'active' ? !task.completed :
        filter === 'completed' ? task.completed :
        filter === 'high-priority' ? task.priority === 'high' : true;

      const matchCategory = selectedCategory === 'all' ? true : task.category === selectedCategory;

      return matchSearch && matchFilter && matchCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sortBy === 'priority') {
        comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const finalCategory = showCustomCat ? (customCategory.trim() || 'General') : category;
    onAddTask({
      text: text.trim(),
      priority,
      category: finalCategory,
      due_date: dueDate || null,
      notes: notes.trim() || null
    });

    // Reset fields
    setText('');
    setDueDate('');
    setNotes('');
    setCustomCategory('');
    setShowCustomCategory(false);
    setIsOpenAddForm(false);
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingIdText(task.text);
    setEditingNotes(task.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    onUpdateTask(id, { text: editingText.trim(), notes: editingNotes.trim() || null });
    setEditingId(null);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div id="task-list" className="space-y-6">
      
      {/* Controls & Options Bar */}
      <div className="bg-white border border-neutral-250/20 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col gap-4">
        
        {/* Search Input */}
        <div id="search-filter-controls" className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search matching tasks or custom curators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-full pl-10 pr-4 py-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400"
          />
        </div>

        {/* Filter Selection Grid */}
        <div id="sorting-filters" className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-neutral-100">
          
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'completed', 'high-priority'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1 cursor-pointer rounded-full text-xs font-mono uppercase tracking-wider transition-all border ${
                  filter === opt 
                    ? 'bg-neutral-950 text-white border-neutral-950 font-medium' 
                    : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {opt.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span className="uppercase text-[10px] text-neutral-400 font-semibold tracking-wider">Sorted by:</span>
            <select
              value={sortBy}
              aria-label="Sort by field"
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none rounded py-0.5 px-1 font-mono font-semibold text-neutral-800 outline-none focus:ring-1 focus:ring-neutral-200 cursor-pointer"
            >
              <option value="created_at">Date Added</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
            </select>
            <button
              onClick={toggleSortOrder}
              aria-label="Toggle sort order"
              className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>

        </div>

        {/* Category Filter Chips */}
        {allCategories.length > 2 && (
          <div id="category-filter-chips" className="flex flex-wrap gap-1.5 items-center pt-2 border-t border-neutral-100">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mr-2 font-semibold">Categories:</span>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-0.5 cursor-pointer rounded-full text-xs font-sans transition-all ${
                  selectedCategory === cat 
                    ? 'bg-neutral-100 text-neutral-950 font-medium underline underline-offset-4 decoration-2 decoration-neutral-950' 
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                {cat === 'all' ? 'All categories' : cat}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Elegant Trigger Button to Add new Task */}
      <div className="flex justify-center">
        {!isOpenAddForm ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpenAddForm(true)}
            className="inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-neutral-250/20 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-mono uppercase tracking-wider py-3 px-8 shadow-sm transition-colors border-neutral-220/30"
          >
            <Plus className="h-4 w-4" />
            Crate New Task
          </motion.button>
        ) : (
          <div className="w-full bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-neutral-100">
              <h4 className="font-serif text-lg text-neutral-900">Task Curation Details</h4>
              <button 
                onClick={() => setIsOpenAddForm(false)}
                className="text-neutral-400 hover:text-neutral-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="task-title" className="block text-[10px] font-mono tracking-wider uppercase text-neutral-450 text-neutral-400 mb-1">Task description *</label>
                <input
                  id="task-title"
                  type="text"
                  placeholder="Capture ideas or define daily execution goals..."
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-lg px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Category select */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label htmlFor="category" className="text-[10px] font-mono tracking-wider uppercase text-neutral-400">Category</label>
                    <button 
                      type="button" 
                      onClick={() => setShowCustomCategory(!showCustomCat)}
                      className="text-[10px] font-mono text-neutral-500 hover:text-neutral-900 underline"
                    >
                      {showCustomCat ? 'Standard List' : 'Write Custom'}
                    </button>
                  </div>
                  {!showCustomCat ? (
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 cursor-pointer"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                      <option value="Design">Design</option>
                      <option value="Ideas">Ideas</option>
                      <option value="Curation">Curation</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Life, Architecture"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-lg px-3 py-2 text-sm text-neutral-900 outline-none transition-colors"
                    />
                  )}
                </div>

                {/* Priority Selector */}
                <div>
                  <label htmlFor="priority" className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1">Priority LEVEL</label>
                  <div id="priority" className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 cursor-pointer text-xs font-mono uppercase tracking-wider rounded-lg border text-center transition-all ${
                          priority === p 
                            ? 'bg-neutral-950 text-white border-neutral-950 font-medium' 
                            : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Due date picker */}
                <div>
                  <label htmlFor="due-date" className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1">Due Date</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                    <input
                      id="due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-lg pl-10 pr-3 py-2 text-sm text-neutral-900 outline-none transition-colors cursor-pointer"
                    />
                  </div>
                </div>

                {/* Additional task details note */}
                <div>
                  <label htmlFor="notes" className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1">Curation Details (Notes)</label>
                  <input
                    id="notes"
                    type="text"
                    placeholder="Provide secondary context details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 rounded-lg px-4 py-2 text-sm text-neutral-900 outline-none transition-colors"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpenAddForm(false)}
                  className="px-5 py-2 cursor-pointer font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 cursor-pointer font-mono text-xs uppercase tracking-wider bg-neutral-950 text-white hover:bg-neutral-800 rounded-full transition-colors shadow-sm font-semibold"
                >
                  Save Task
                </button>
              </div>

            </form>
          </div>
        )}
      </div>

      {/* Task List items list */}
      <div id="task-items-container" className="space-y-3">
        <AnimatePresence initial={false}>
          {filteredTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 px-4 bg-neutral-50/50 border border-dashed border-neutral-200 rounded-2xl"
            >
              <FolderOpen className="h-6 w-6 text-neutral-300 mx-auto mb-3" />
              <p className="font-serif text-lg text-neutral-700 leading-normal">No filtered tasks in this view</p>
              <p className="text-neutral-400 text-xs mt-1">Crate a new task or adjust your search filter rules.</p>
            </motion.div>
          ) : (
            filteredTasks.map(task => {
              const isOverdue = !task.completed && task.due_date && task.due_date < new Date().toISOString().split('T')[0];

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white border rounded-2xl p-4 md:p-5 transition-all shadow-6 ${
                    task.completed 
                      ? 'border-neutral-200/50 opacity-60 bg-neutral-100/10' 
                      : isOverdue 
                        ? 'border-rose-100 bg-rose-50/10 hover:border-rose-200' 
                        : 'border-neutral-200 hover:border-neutral-350 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    
                    {/* Unique Custom Minimal Checkbox */}
                    <button
                      aria-label="Toggle task completed status"
                      onClick={() => onUpdateTask(task.id, { completed: !task.completed })}
                      className={`h-4.5 w-4.5 rounded-full shrink-0 mt-1 cursor-pointer flex items-center justify-center transition-all border ${
                        task.completed 
                          ? 'bg-neutral-900 border-neutral-950 text-white' 
                          : isOverdue 
                            ? 'border-rose-400 hover:bg-rose-500/10' 
                            : 'border-neutral-300 hover:border-neutral-900'
                      }`}
                    >
                      {task.completed && <Check className="h-3 w-3" />}
                    </button>

                    {/* Task Content text */}
                    <div className="flex-grow min-w-0">
                      {editingId === task.id ? (
                        <div className="space-y-3 mt-1">
                          <input
                            type="text"
                            aria-label="Edit task title"
                            value={editingText}
                            onChange={(e) => setEditingIdText(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-300 rounded px-2.5 py-1 text-sm text-neutral-900 outline-none focus:border-neutral-950 font-normal"
                          />
                          <input
                            type="text"
                            aria-label="Edit task notes"
                            value={editingNotes}
                            placeholder="Add notes..."
                            onChange={(e) => setEditingNotes(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-xs text-neutral-500 outline-none focus:border-neutral-500 font-normal"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(task.id)}
                              className="px-3 py-1 cursor-pointer bg-neutral-900 text-white rounded text-xs font-mono uppercase tracking-wider font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 cursor-pointer bg-neutral-100 text-neutral-500 rounded text-xs font-mono uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex flex-wrap items-baseline gap-2.5">
                            <h4 className={`text-sm md:text-base font-normal tracking-tight leading-tight ${
                              task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
                            }`}>
                              {task.text}
                            </h4>
                            
                            {/* Inline metadata pills */}
                            <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider bg-neutral-50 border border-neutral-200 text-neutral-400 py-0.5 px-2 rounded-full">
                              <Tag className="h-2 w-2" />
                              {task.category}
                            </span>

                            {task.priority !== 'low' && (
                              <span className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider py-0.5 px-2 rounded-full border ${
                                task.priority === 'high' 
                                  ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                  : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                          </div>

                          {task.notes && (
                            <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed font-light">
                              {task.notes}
                            </p>
                          )}

                          {/* Date and actions display */}
                          <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-neutral-100 gap-3">
                            <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-400 tracking-wide uppercase">
                              {task.due_date && (
                                <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-500 font-semibold' : ''}`}>
                                  {isOverdue && <AlertTriangle className="h-3 w-3 inline text-rose-500" />}
                                  <span>Due:</span>
                                  <span>{task.due_date}</span>
                                </span>
                              )}
                              <span>Created {new Date(task.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                aria-label="Edit task"
                                onClick={() => handleStartEdit(task)}
                                className="text-neutral-400 hover:text-neutral-700 p-1"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                aria-label="Delete task"
                                onClick={() => onDeleteTask(task.id)}
                                className="text-neutral-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
