import { apiClient } from "./apiClient";

import type {
  AcademicPerformance,
  PoorPerformanceSummary,
  DecliningPerformanceSummary,
  CreateAcademicPerformanceRequest,
  UpdateAcademicPerformanceRequest,
} from "../types/academicPerformance";

export async function getAcademicPerformance(
  includeInactive = false
): Promise<AcademicPerformance[]> {
  const params = new URLSearchParams();

  params.append("includeInactive", String(includeInactive));

  const response = await apiClient(
    `/api/AcademicPerformance?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to load academic performance records.");
  }

  return response.json();
}

export async function getAcademicPerformanceById(
  id: number
): Promise<AcademicPerformance> {
  const response = await apiClient(`/api/AcademicPerformance/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load academic performance record.");
  }

  return response.json();
}

export async function getStudentAcademicPerformance(
  studentId: number
): Promise<AcademicPerformance[]> {
  const response = await apiClient(
    `/api/AcademicPerformance/student/${studentId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load student academic performance.");
  }

  return response.json();
}

export async function getPoorPerformance(
  threshold: number,
  subject = ""
): Promise<PoorPerformanceSummary[]> {
  const params = new URLSearchParams();

  params.append("threshold", String(threshold));

  if (subject.trim()) {
    params.append("subject", subject.trim());
  }

  const response = await apiClient(
    `/api/AcademicPerformance/poor?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to load poor performance report.");
  }

  return response.json();
}

export async function getDecliningPerformance(
  subject = ""
): Promise<DecliningPerformanceSummary[]> {
  const params = new URLSearchParams();

  if (subject.trim()) {
    params.append("subject", subject.trim());
  }

  const query = params.toString();

  const response = await apiClient(
    query
      ? `/api/AcademicPerformance/declining?${query}`
      : "/api/AcademicPerformance/declining"
  );

  if (!response.ok) {
    throw new Error("Failed to load declining performance report.");
  }

  return response.json();
}

export async function createAcademicPerformance(
  data: CreateAcademicPerformanceRequest
): Promise<AcademicPerformance> {
  const response = await apiClient("/api/AcademicPerformance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create academic performance record.");
  }

  return response.json();
}

export async function updateAcademicPerformance(
  id: number,
  data: UpdateAcademicPerformanceRequest
): Promise<AcademicPerformance> {
  const response = await apiClient(`/api/AcademicPerformance/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update academic performance record.");
  }

  return response.json();
}

export async function deactivateAcademicPerformance(
  id: number
): Promise<AcademicPerformance> {
  const response = await apiClient(
    `/api/AcademicPerformance/${id}/deactivate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to deactivate academic performance record.");
  }

  return response.json();
}

export async function activateAcademicPerformance(
  id: number
): Promise<AcademicPerformance> {
  const response = await apiClient(
    `/api/AcademicPerformance/${id}/activate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to activate academic performance record.");
  }

  return response.json();
}