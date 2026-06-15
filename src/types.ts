export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  user_id: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string | null;
}
