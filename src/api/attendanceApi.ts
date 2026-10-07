import { apiClient } from "./apiClient";
import type {
  Attendance,
  AttendanceSummary,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from "../types/attendance";

export async function getAttendance(
  includeInactive = false
): Promise<Attendance[]> {
  const response = await apiClient(
    `/api/attendance?includeInactive=${includeInactive}`
  );

  if (!response.ok) {
    throw new Error("Failed to load attendance records.");
  }

  return response.json();
}

export async function getAttendanceById(
  id: number
): Promise<Attendance> {
  const response = await apiClient(
    `/api/attendance/${id}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Attendance record not found.");
    }

    throw new Error("Failed to load attendance record.");
  }

  return response.json();
}

export async function getStudentAttendance(
  studentId: number
): Promise<Attendance[]> {
  const response = await apiClient(
    `/api/attendance/student/${studentId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load student attendance history."
    );
  }

  return response.json();
}

export async function getAttendanceSummary(
  threshold?: number
): Promise<AttendanceSummary[]> {
  const url =
    threshold === undefined
      ? "/api/attendance/summary"
      : `/api/attendance/summary?threshold=${threshold}`;

  const response = await apiClient(url);

  if (!response.ok) {
    throw new Error("Failed to load attendance summary.");
  }

  return response.json();
}

export async function createAttendance(
  data: CreateAttendanceDto
): Promise<Attendance> {
  const response = await apiClient("/api/attendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to create attendance record."
    );
  }

  return response.json();
}

export async function updateAttendance(
  id: number,
  data: UpdateAttendanceDto
): Promise<Attendance> {
  const response = await apiClient(
    `/api/attendance/${id}`,
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
      message || "Failed to update attendance record."
    );
  }

  return response.json();
}

export async function deactivateAttendance(
  id: number
): Promise<Attendance> {
  const response = await apiClient(
    `/api/attendance/${id}/deactivate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to deactivate attendance record."
    );
  }

  return response.json();
}

export async function activateAttendance(
  id: number
): Promise<Attendance> {
  const response = await apiClient(
    `/api/attendance/${id}/activate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to activate attendance record."
    );
  }

  return response.json();
}