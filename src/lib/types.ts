
import { FieldValue } from "firebase/firestore";

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
  thinking?: string;
};
