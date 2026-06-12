export interface Document {
  id: number;
  filename: string;
  file_path?: string;
  file_size?: number | null;
  content_type?: string | null;
  workspace_id: number;
  uploaded_by: number;
  created_at?: string | null;
}