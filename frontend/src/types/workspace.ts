export interface Workspace {
  id: number;
  name: string;
  description?: string | null;
  user_id: number;
  created_at?: string | null;
}