import { createClient } from '@supabase/supabase-js';
import { Task } from './types';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'MY_SUPABASE_URL');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Local storage mock helpers for Sandbox Mode
const STORAGE_PREFIX = 'minimalist_todo_';

const getLocalTasks = (): Task[] => {
  const data = localStorage.getItem(`${STORAGE_PREFIX}tasks`);
  if (!data) {
    // Seed beautiful default tasks so the first experience is gorgeous and functional
    const defaultTasks: Task[] = [
      {
        id: '1',
        text: 'Embrace minimalist design elements and typography',
        completed: true,
        priority: 'high',
        category: 'Ideas',
        due_date: new Date().toISOString().split('T')[0],
        notes: 'Inspired by the Cosmos.so editorial styling with high contrast negative spaces.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        user_id: 'sandbox-user'
      },
      {
        id: '2',
        text: 'Curate weekly color palettes and layout concepts',
        completed: false,
        priority: 'medium',
        category: 'Design',
        due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        notes: 'Combine warm tones like #FBFBFA with deep charcoal contrasts.',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user_id: 'sandbox-user'
      },
      {
        id: '3',
        text: 'Practice spatial awareness in active interfaces',
        completed: false,
        priority: 'low',
        category: 'Curation',
        due_date: null,
        notes: 'Let elements breathe. Whitespace is the active feature.',
        created_at: new Date().toISOString(),
        user_id: 'sandbox-user'
      }
    ];
    localStorage.setItem(`${STORAGE_PREFIX}tasks`, JSON.stringify(defaultTasks));
    return defaultTasks;
  }
  return JSON.parse(data);
};

const saveLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(`${STORAGE_PREFIX}tasks`, JSON.stringify(tasks));
};

// Unified Database and Auth actions
export const db = {
  // Check auth state
  async getUser() {
    if (isSupabaseConfigured && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return null;
      return user;
    } else {
      // Mock Sandbox user check
      const session = localStorage.getItem(`${STORAGE_PREFIX}session`);
      if (session) {
        return JSON.parse(session);
      }
      return null;
    }
  },

  // Auth actions
  async signUp(email: string, password: string, fullName: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) throw error;
      return data.user;
    } else {
      // Sandbox mode signup
      const mockUser = {
        id: 'sandbox-user',
        email,
        user_metadata: { full_name: fullName || email.split('@')[0] }
      };
      localStorage.setItem(`${STORAGE_PREFIX}session`, JSON.stringify(mockUser));
      return mockUser;
    }
  },

  async signIn(email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data.user;
    } else {
      // Sandbox mode login
      const mockUser = {
        id: 'sandbox-user',
        email,
        user_metadata: { full_name: email.split('@')[0] }
      };
      localStorage.setItem(`${STORAGE_PREFIX}session`, JSON.stringify(mockUser));
      return mockUser;
    }
  },

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}session`);
    }
  },

  // Task actions (reads & writes)
  async getTasks(userId: string): Promise<Task[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase getTasks error:', error);
        // Fallback to local sandbox if database table tasks doesn't exist yet
        return getLocalTasks();
      }
      return data || [];
    } else {
      // Sandbox mode tasks
      return getLocalTasks();
    }
  },

  async addTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select();

      if (error) {
        console.warn('Supabase insert failed, using fallback:', error.message);
        // Fallback to local storage on error
        const localTasks = getLocalTasks();
        localTasks.unshift(newTask);
        saveLocalTasks(localTasks);
        return newTask;
      }
      return data[0];
    } else {
      const localTasks = getLocalTasks();
      localTasks.unshift(newTask);
      saveLocalTasks(localTasks);
      return newTask;
    }
  },

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'user_id'>>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.warn('Supabase update failed, using fallback:', error.message);
        const localTasks = getLocalTasks();
        const index = localTasks.findIndex(t => t.id === id);
        if (index !== -1) {
          localTasks[index] = { ...localTasks[index], ...updates };
          saveLocalTasks(localTasks);
        }
      }
    } else {
      const localTasks = getLocalTasks();
      const index = localTasks.findIndex(t => t.id === id);
      if (index !== -1) {
        localTasks[index] = { ...localTasks[index], ...updates };
        saveLocalTasks(localTasks);
      }
    }
  },

  async deleteTask(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase delete failed, using fallback:', error.message);
        const localTasks = getLocalTasks();
        const filtered = localTasks.filter(t => t.id !== id);
        saveLocalTasks(filtered);
      }
    } else {
      const localTasks = getLocalTasks();
      const filtered = localTasks.filter(t => t.id !== id);
      saveLocalTasks(filtered);
    }
  }
};
