import { apiClient } from "./apiClient";
import type { Teacher } from "../types/teacher";

export async function getTeachers(
  includeInactive = false,
  search = ""
): Promise<Teacher[]> {
  const params = new URLSearchParams();

  params.append("includeInactive", String(includeInactive));

  if (search.trim()) {
    params.append("search", search.trim());
  }

  const response = await apiClient(
    `/api/Teachers?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to load teachers.");
  }

  return response.json();
}

export async function getTeacherById(
  id: number
): Promise<Teacher> {
  const response = await apiClient(
    `/api/Teachers/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to load teacher.");
  }

  return response.json();
}

export interface CreateTeacherRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export async function createTeacher(
  teacher: CreateTeacherRequest
): Promise<Teacher> {
  const response = await apiClient("/api/Teachers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teacher),
  });

  if (!response.ok) {
    throw new Error("Failed to create teacher.");
  }

  return response.json();
}

export interface UpdateTeacherRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export async function updateTeacher(
  id: number,
  teacher: UpdateTeacherRequest
): Promise<Teacher> {
  const response = await apiClient(
    `/api/Teachers/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teacher),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update teacher.");
  }

  return response.json();
}

export async function deactivateTeacher(
  id: number
): Promise<Teacher> {
  const response = await apiClient(
    `/api/Teachers/${id}/deactivate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to deactivate teacher.");
  }

  return response.json();
}

export async function activateTeacher(
  id: number
): Promise<Teacher> {
  const response = await apiClient(
    `/api/Teachers/${id}/activate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to activate teacher.");
  }

  return response.json();
}