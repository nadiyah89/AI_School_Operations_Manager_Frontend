import { apiClient } from "./apiClient";
import type {
  CreateNotificationDto,
  Notification,
  NotificationStatus,
  UpdateNotificationDto,
} from "../types/notification";

interface NotificationQueryParams {
  includeInactive?: boolean;
  status?: NotificationStatus;
  studentId?: number;
  parentId?: number;
}

export async function getNotifications(
  params: NotificationQueryParams = {}
): Promise<Notification[]> {
  const searchParams = new URLSearchParams();

  searchParams.set(
    "includeInactive",
    String(params.includeInactive ?? false)
  );

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.studentId !== undefined) {
    searchParams.set(
      "studentId",
      String(params.studentId)
    );
  }

  if (params.parentId !== undefined) {
    searchParams.set(
      "parentId",
      String(params.parentId)
    );
  }

  const response = await apiClient(
    `/api/notifications?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to load notifications.");
  }

  return response.json();
}

export async function getNotificationById(
  id: number
): Promise<Notification> {
  const response = await apiClient(
    `/api/notifications/${id}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Notification not found.");
    }

    throw new Error(
      "Failed to load notification."
    );
  }

  return response.json();
}

export async function getStudentNotifications(
  studentId: number
): Promise<Notification[]> {
  const response = await apiClient(
    `/api/notifications/student/${studentId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load student notifications."
    );
  }

  return response.json();
}

export async function getParentNotifications(
  parentId: number
): Promise<Notification[]> {
  const response = await apiClient(
    `/api/notifications/parent/${parentId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load parent notifications."
    );
  }

  return response.json();
}

export async function createNotification(
  data: CreateNotificationDto
): Promise<Notification> {
  const response = await apiClient(
    "/api/notifications",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Failed to create notification."
    );
  }

  return response.json();
}

export async function updateNotification(
  id: number,
  data: UpdateNotificationDto
): Promise<Notification> {
  const response = await apiClient(
    `/api/notifications/${id}`,
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
      message ||
        "Failed to update notification."
    );
  }

  return response.json();
}

export async function deactivateNotification(
  id: number
): Promise<Notification> {
  const response = await apiClient(
    `/api/notifications/${id}/deactivate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Failed to deactivate notification."
    );
  }

  return response.json();
}

export async function activateNotification(
  id: number
): Promise<Notification> {
  const response = await apiClient(
    `/api/notifications/${id}/activate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Failed to activate notification."
    );
  }

  return response.json();
}