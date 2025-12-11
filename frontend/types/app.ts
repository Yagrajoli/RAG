export type SourceType = "file" | "url";

export interface Source {
  id: string;
  type: SourceType;
  name?: string;  // for files
  url?: string;   // for URLs
  file?: File;    // for upload
  status: "pending" | "processing" | "indexed" | "failed";
  error?: string;
  createdAt: Date;
}

export interface Citation {
  sourceId: string;
  page?: number;
  excerpt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

