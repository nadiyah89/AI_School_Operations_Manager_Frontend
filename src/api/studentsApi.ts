import { apiClient } from "./apiClient";
import type { Student } from "../types/student";

export async function getStudents(
  includeInactive = false,
  search = ""
): Promise<Student[]> {
  const params = new URLSearchParams();

  params.append("includeInactive", String(includeInactive));

  if (search.trim()) {
    params.append("search", search.trim());
  }

  const response = await apiClient(
    `/api/Students?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to load students.");
  }

  return response.json();
}


export async function getStudentById(id: number): Promise<Student> {
  const response = await apiClient(`/api/Students/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load student.");
  }

  return response.json();
}


export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export async function createStudent(
  student: CreateStudentRequest
): Promise<Student> {
  const response = await apiClient("/api/Students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });

  if (!response.ok) {
    throw new Error("Failed to create student.");
  }

  return response.json();
}



export interface UpdateStudentRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export async function updateStudent(
  id: number,
  student: UpdateStudentRequest
): Promise<Student> {
  const response = await apiClient(`/api/Students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });

  if (!response.ok) {
    throw new Error("Failed to update student.");
  }

  return response.json();
}

export async function deactivateStudent(
  id: number
): Promise<Student> {
  const response = await apiClient(
    `/api/Students/${id}/deactivate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to deactivate student.");
  }

  return response.json();
}

export async function activateStudent(
  id: number
): Promise<Student> {
  const response = await apiClient(
    `/api/Students/${id}/activate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to activate student.");
  }

  return response.json();
}

