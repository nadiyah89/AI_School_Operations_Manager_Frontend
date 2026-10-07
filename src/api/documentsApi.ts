import { apiClient } from "./apiClient";
import type {
  CreateDocumentDto,
  Document,
  DocumentSummary,
  UpdateDocumentDto,
} from "../types/document";

export async function getDocuments(
  includeInactive = false
): Promise<Document[]> {
  const response = await apiClient(
    `/api/documents?includeInactive=${includeInactive}`
  );

  if (!response.ok) {
    throw new Error("Failed to load documents.");
  }

  return response.json();
}

export async function getDocumentCatalog(
  category?: string
): Promise<DocumentSummary[]> {
  const query = category
    ? `?category=${encodeURIComponent(category)}`
    : "";

  const response = await apiClient(
    `/api/documents/catalog${query}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load document catalog."
    );
  }

  return response.json();
}

export async function getDocumentById(
  id: number
): Promise<Document> {
  const response = await apiClient(
    `/api/documents/${id}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Document not found.");
    }

    throw new Error("Failed to load document.");
  }

  return response.json();
}

export async function createDocument(
  data: CreateDocumentDto
): Promise<Document> {
  const response = await apiClient("/api/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to create document."
    );
  }

  return response.json();
}

export async function updateDocument(
  id: number,
  data: UpdateDocumentDto
): Promise<Document> {
  const response = await apiClient(
    `/api/documents/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to update document."
    );
  }

  return response.json();
}

export async function deactivateDocument(
  id: number
): Promise<Document> {
  const response = await apiClient(
    `/api/documents/${id}/deactivate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to deactivate document."
    );
  }

  return response.json();
}

export async function activateDocument(
  id: number
): Promise<Document> {
  const response = await apiClient(
    `/api/documents/${id}/activate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to activate document."
    );
  }

  return response.json();
}