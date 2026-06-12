export interface Chat {
  id: number;
  title: string;
  workspace_id: number;
}

export interface Message {
  id: number;
  chat_id?: number;
  role: "user" | "assistant";
  content: string;
}