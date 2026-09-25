import { apiClient } from "./apiClient";
import type {
  Parent,
  CreateParentRequest,
  UpdateParentRequest,
} from "../types/parent";

export async function getParents(
  includeInactive = false,
  search = ""
): Promise<Parent[]> {
  const params = new URLSearchParams();

  params.append("includeInactive", String(includeInactive));

  if (search.trim()) {
    params.append("search", search.trim());
  }

  const response = await apiClient(`/api/Parents?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load parents.");
  }

  return response.json();
}

export async function getParentById(id: number): Promise<Parent> {
  const response = await apiClient(`/api/Parents/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load parent.");
  }

  return response.json();
}

export async function getParentsByStudent(
  studentId: number
): Promise<Parent[]> {
  const response = await apiClient(`/api/Parents/student/${studentId}`);

  if (!response.ok) {
    throw new Error("Failed to load parents for this student.");
  }

  return response.json();
}

export async function createParent(
  data: CreateParentRequest
): Promise<Parent> {
  const response = await apiClient("/api/Parents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create parent.");
  }

  return response.json();
}

export async function updateParent(
  id: number,
  data: UpdateParentRequest
): Promise<Parent> {
  const response = await apiClient(`/api/Parents/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update parent.");
  }

  return response.json();
}

export async function deactivateParent(id: number): Promise<Parent> {
  const response = await apiClient(`/api/Parents/${id}/deactivate`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to deactivate parent.");
  }

  return response.json();
}

export async function activateParent(id: number): Promise<Parent> {
  const response = await apiClient(`/api/Parents/${id}/activate`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to activate parent.");
  }

  return response.json();
}