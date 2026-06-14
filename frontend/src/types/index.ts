export type Tier = "free" | "pro" | "team";

export interface MeResponse {
  id: string;
  email: string;
  name?: string | null;
  image_url?: string | null;
  tier: Tier;
}

export interface UsageResponse {
  tier: Tier;
  messages_today: number;
  daily_limit: number;
  input_tokens: number;
  output_tokens: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}
