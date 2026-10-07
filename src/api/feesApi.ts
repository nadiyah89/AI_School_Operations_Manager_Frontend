import { apiClient } from "./apiClient";
import type {
  CreateFeeRecordDto,
  FeeRecord,
  FeeSummary,
  OutstandingFee,
  UpdateFeeRecordDto,
} from "../types/fee";

export async function getFeeRecords(
  includeInactive = false
): Promise<FeeRecord[]> {
  const response = await apiClient(
    `/api/feerecords?includeInactive=${includeInactive}`
  );

  if (!response.ok) {
    throw new Error("Failed to load fee records.");
  }

  return response.json();
}

export async function getOutstandingFees(): Promise<OutstandingFee[]> {
  const response = await apiClient("/api/feerecords/outstanding");

  if (!response.ok) {
    throw new Error("Failed to load outstanding fees.");
  }

  return response.json();
}

export async function getOverdueFees(): Promise<OutstandingFee[]> {
  const response = await apiClient("/api/feerecords/overdue");

  if (!response.ok) {
    throw new Error("Failed to load overdue fees.");
  }

  return response.json();
}

export async function getFeeSummary(): Promise<FeeSummary> {
  const response = await apiClient("/api/feerecords/summary");

  if (!response.ok) {
    throw new Error("Failed to load fee summary.");
  }

  return response.json();
}

export async function getFeeRecordById(
  id: number
): Promise<FeeRecord> {
  const response = await apiClient(`/api/feerecords/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Fee record not found.");
    }

    throw new Error("Failed to load fee record.");
  }

  return response.json();
}

export async function getStudentFees(
  studentId: number
): Promise<FeeRecord[]> {
  const response = await apiClient(
    `/api/feerecords/student/${studentId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load student fee records.");
  }

  return response.json();
}

export async function createFeeRecord(
  data: CreateFeeRecordDto
): Promise<FeeRecord> {
  const response = await apiClient("/api/feerecords", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create fee record.");
  }

  return response.json();
}

export async function updateFeeRecord(
  id: number,
  data: UpdateFeeRecordDto
): Promise<FeeRecord> {
  const response = await apiClient(`/api/feerecords/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to update fee record.");
  }

  return response.json();
}

export async function deactivateFeeRecord(
  id: number
): Promise<FeeRecord> {
  const response = await apiClient(
    `/api/feerecords/${id}/deactivate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || "Failed to deactivate fee record."
    );
  }

  return response.json();
}

export async function activateFeeRecord(
  id: number
): Promise<FeeRecord> {
  const response = await apiClient(
    `/api/feerecords/${id}/activate`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || "Failed to activate fee record."
    );
  }

  return response.json();
}