import { apiClient } from "./apiClient";
import type {
  CreateMeetingDto,
  Meeting,
  MeetingStatus,
  MeetingSummary,
  UpdateMeetingDto,
} from "../types/meeting";

export async function getMeetings(
  includeInactive = false
): Promise<Meeting[]> {
  const response = await apiClient(
    `/api/meetings?includeInactive=${includeInactive}`
  );

  if (!response.ok) {
    throw new Error("Failed to load meetings.");
  }

  return response.json();
}

export async function getMyMeetings(
  status?: MeetingStatus,
  date?: string
): Promise<MeetingSummary[]> {
  const params = new URLSearchParams();

  if (status) {
    params.append("status", status);
  }

  if (date) {
    params.append("date", date);
  }

  const query = params.toString();

  const response = await apiClient(
    query
      ? `/api/meetings/my?${query}`
      : "/api/meetings/my"
  );

  if (!response.ok) {
    throw new Error("Failed to load your meetings.");
  }

  return response.json();
}

export async function getMeetingById(
  id: number
): Promise<Meeting> {
  const response = await apiClient(
    `/api/meetings/${id}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Meeting not found.");
    }

    throw new Error("Failed to load meeting.");
  }

  return response.json();
}

export async function getStudentMeetings(
  studentId: number
): Promise<Meeting[]> {
  const response = await apiClient(
    `/api/meetings/student/${studentId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load student meetings."
    );
  }

  return response.json();
}

export async function getTeacherMeetings(
  teacherId: number
): Promise<Meeting[]> {
  const response = await apiClient(
    `/api/meetings/teacher/${teacherId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load teacher meetings."
    );
  }

  return response.json();
}

export async function createMeeting(
  data: CreateMeetingDto
): Promise<Meeting> {
  const response = await apiClient("/api/meetings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to create meeting."
    );
  }

  return response.json();
}

export async function updateMeeting(
  id: number,
  data: UpdateMeetingDto
): Promise<Meeting> {
  const response = await apiClient(
    `/api/meetings/${id}`,
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
      message || "Failed to update meeting."
    );
  }

  return response.json();
}

export async function deactivateMeeting(
  id: number
): Promise<Meeting> {
  const response = await apiClient(
    `/api/meetings/${id}/deactivate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to deactivate meeting."
    );
  }

  return response.json();
}

export async function activateMeeting(
  id: number
): Promise<Meeting> {
  const response = await apiClient(
    `/api/meetings/${id}/activate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to activate meeting."
    );
  }

  return response.json();
}