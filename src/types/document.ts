export interface Document {
  id: number;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface DocumentSummary {
  id: number;
  title: string;
  category: string;
  updatedAt: string;
}

export interface CreateDocumentDto {
  title: string;
  category: string;
  content: string;
}

export interface UpdateDocumentDto {
  title: string;
  category: string;
  content: string;
}