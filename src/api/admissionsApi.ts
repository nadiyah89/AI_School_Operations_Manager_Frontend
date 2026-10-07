import { apiClient } from "./apiClient";
import type {
  AdmissionApplication,
  AdmissionStatus,
  AdmissionSummary,
  CreateAdmissionDto,
  CreateParentFromAdmissionDto,
  CreatedParent,
  CreatedStudent,
  UpdateAdmissionDto,
} from "../types/admission";

export async function getAdmissions(
  status?: AdmissionStatus
): Promise<AdmissionApplication[]> {
  const url = status
    ? `/api/admissions?status=${encodeURIComponent(
        status
      )}`
    : "/api/admissions";

  const response = await apiClient(url);

  if (!response.ok) {
    throw new Error("Failed to load admissions.");
  }

  return response.json();
}

export async function getAdmissionSummary(): Promise<AdmissionSummary> {
  const response = await apiClient(
    "/api/admissions/summary"
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load admission summary."
    );
  }

  return response.json();
}

export async function getAdmissionById(
  id: number
): Promise<AdmissionApplication> {
  const response = await apiClient(
    `/api/admissions/${id}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "Admission application not found."
      );
    }

    throw new Error(
      "Failed to load admission application."
    );
  }

  return response.json();
}

export async function createAdmission(
  data: CreateAdmissionDto
): Promise<AdmissionApplication> {
  const response = await apiClient(
    "/api/admissions",
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
        "Failed to create admission application."
    );
  }

  return response.json();
}

export async function updateAdmission(
  id: number,
  data: UpdateAdmissionDto
): Promise<AdmissionApplication> {
  const response = await apiClient(
    `/api/admissions/${id}`,
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
        "Failed to update admission application."
    );
  }

  return response.json();
}

export async function approveAdmission(
  id: number
): Promise<AdmissionApplication> {
  const response = await apiClient(
    `/api/admissions/${id}/approve`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Failed to approve admission application."
    );
  }

  return response.json();
}

export async function rejectAdmission(
  id: number
): Promise<AdmissionApplication> {
  const response = await apiClient(
    `/api/admissions/${id}/reject`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Failed to reject admission application."
    );
  }

  return response.json();
}

export async function waitlistAdmission(
  id: number
): Promise<AdmissionApplication> {
  const response = await apiClient(
    `/api/admissions/${id}/waitlist`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Failed to waitlist admission application."
    );
  }

  return response.json();
}

export async function createStudentFromAdmission(
  id: number
): Promise<CreatedStudent> {
  const response = await apiClient(
    `/api/admissions/${id}/create-student`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Failed to create student from admission."
    );
  }

  return response.json();
}

export async function createParentFromAdmission(
  id: number,
  data: CreateParentFromAdmissionDto
): Promise<CreatedParent> {
  const response = await apiClient(
    `/api/admissions/${id}/create-parent`,
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
        "Failed to create parent from admission."
    );
  }

  return response.json();
}