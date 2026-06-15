import { useEffect, useState } from 'react';
import { db, isSupabaseConfigured } from './supabase';
import { Task } from './types';
import Auth from './components/Auth';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  Sparkles, 
  Layers, 
  Terminal, 
  Bookmark, 
  Github,
  CloudLightning,
  User,
  Clock,
  Compass
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // 1. Authenticate user session on mount
  useEffect(() => {
    async function checkUser() {
      try {
        const currentUser = await db.getUser();
        setUser(currentUser);
      } catch (e) {
        console.error('Session check error', e);
      } finally {
        setAuthLoading(false);
      }
    }
    checkUser();
  }, []);

  // 2. Track elapsed session duration (starts at 00:00, resets when active user login changes)
  useEffect(() => {
    setSecondsElapsed(0);
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const formatSessionTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ];
    
    if (hours > 0) {
      parts.unshift(hours.toString().padStart(2, '0'));
    }
    
    return parts.join(':');
  };

  // 3. Fetch tasks once user is set (use user primitive key to avoid infinite array triggers)
  const userId = user?.id;
  useEffect(() => {
    if (!userId) {
      setTasks([]);
      return;
    }

    async function loadTasks() {
      try {
        setTasksLoading(true);
        const data = await db.getTasks(userId);
        setTasks(data);
      } catch (e) {
        console.error('Failed to load tasks', e);
      } finally {
        setTasksLoading(false);
      }
    }

    loadTasks();
  }, [userId]);

  // Task Mutator triggers
  const handleAddTask = async (taskData: { text: string; priority: 'low' | 'medium' | 'high'; category: string; due_date: string | null; notes: string | null }) => {
    if (!user) return;
    try {
      const added = await db.addTask({
        ...taskData,
        completed: false,
        user_id: user.id
      });
      setTasks(prev => [added, ...prev]);
    } catch (e) {
      console.error('Error adding task', e);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      await db.updateTask(id, updates);
    } catch (e) {
      console.error('Error updating task', e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setTasks(prev => prev.filter(t => t.id !== id));
      await db.deleteTask(id);
    } catch (e) {
      console.error('Error deleting task', e);
    }
  };

  const handleLogout = async () => {
    try {
      await db.signOut();
      setUser(null);
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-neutral-400">
        <span className="h-5 w-5 border border-neutral-400 border-t-neutral-100 rounded-full animate-spin mb-4" />
        Synchronizing session
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      
      {/* Brand Navigation Bar */}
      <header className="border-b border-neutral-200/50 bg-white/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Minimalist Cosmos Icon */}
            <Compass className="h-5 w-5 text-neutral-900 flex-shrink-0 animate-spin-slow" />
            <span className="font-serif text-lg tracking-tight font-medium">ടുഡു</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-neutral-400 tracking-wider flex items-center gap-1.5 bg-neutral-150/40 py-1 px-3 rounded-full border border-neutral-200/40">
              <Clock className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <span>Session: {formatSessionTime(secondsElapsed)}</span>
            </span>

            {user && (
              <button
                onClick={handleLogout}
                className="text-[10px] font-mono tracking-widest uppercase text-neutral-450 hover:text-neutral-900 transition-colors flex items-center gap-1 cursor-pointer bg-neutral-100/70 hover:bg-neutral-100 py-1.5 px-3 rounded-full border border-neutral-200/30"
              >
                <LogOut className="h-3.5 w-3.5 text-neutral-500" />
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="auth-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Auth onAuthSuccess={(curatedUser) => setUser(curatedUser)} />
            </motion.div>
          ) : (
            <motion.div
              key="workspace-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              
              {/* editorial Welcome Banner */}
              <div id="welcome-banner" className="pt-2 pb-6 border-b border-neutral-200/40">
                <span className="font-mono text-[10px] uppercase text-neutral-400 tracking-widest bg-emerald-500/10 text-emerald-800 font-semibold px-2.5 py-1 rounded-full inline-block mb-3">
                  Core active workspace
                </span>
                
                <h1 className="font-serif text-3xl md:text-4xl text-neutral-900 font-light tracking-tight leading-tight">
                  Welcome to ടുഡു, <span className="font-normal italic">{user.user_metadata?.full_name || 'Curator'}</span>
                </h1>
                
                <p className="text-neutral-500 text-sm mt-2 max-w-xl font-light">
                  Align priority metrics, outline context details, and organize work. Every checkmark triggers dynamic state tracking below.
                </p>
              </div>

              {/* Performance / Metrics Panels */}
              <TaskStats tasks={tasks} />

              {/* Task board components details */}
              {tasksLoading ? (
                <div className="py-20 text-center text-xs font-mono text-neutral-400 uppercase tracking-widest">
                  <span className="h-5 w-5 border-2 border-neutral-900 border-t-neutral-100 rounded-full animate-spin mx-auto mb-4 block" />
                  Synchronizing records
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Aesthetic design credit footer */}
      <footer className="max-w-4xl mx-auto px-6 py-16 border-t border-neutral-200/30 text-center font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
        <div id="footer-logo" className="text-neutral-900 font-serif lowercase text-base mb-2 font-semibold">task curation</div>
        <p className="font-light">Made with ❤️ by Anirudh </p>
      </footer>

    </div>
  );
}
