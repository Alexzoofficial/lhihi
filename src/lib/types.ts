
import { FieldValue } from "firebase/firestore";

export type AIModel = {
  id: string;
  name: string;
  description: string;
};

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'googleai/gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    description: 'Fast and efficient - Best for quick responses',
  },
  {
    id: 'googleai/gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Balanced performance and speed',
  },
  {
    id: 'googleai/gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Most capable - Best for complex tasks',
  },
];

export type Attachment = {
  name: string;
  type: string;
  size: number;
  preview: string;
  file: File | null;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  createdAt: FieldValue | Date;
  onRegenerate?: () => void;
  onSelectQuery?: (query: string) => void;
  onAudioGenerated?: (messageId: string, audioUrl: string) => void;
  onEdit?: (newContent: string) => void;
  audioUrl?: string;
  relatedQueries?: string[];
  sources?: string[];
};
