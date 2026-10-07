export type AdmissionStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Waitlisted";

export interface AdmissionApplication {
  id: number;
  applicantFirstName: string;
  applicantLastName: string;
  dateOfBirth: string;
  applyingForClass: string;
  parentName: string;
  parentPhoneNumber: string;
  parentEmail: string;
  applicationDate: string;
  status: AdmissionStatus;
  studentId: number | null;
  parentId: number | null;
}

export interface CreateAdmissionDto {
  applicantFirstName: string;
  applicantLastName: string;
  dateOfBirth: string;
  applyingForClass: string;
  parentName: string;
  parentPhoneNumber: string;
  parentEmail: string;
}

export interface UpdateAdmissionDto {
  applicantFirstName: string;
  applicantLastName: string;
  dateOfBirth: string;
  applyingForClass: string;
  parentName: string;
  parentPhoneNumber: string;
  parentEmail: string;
}

export interface CreateParentFromAdmissionDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  relationship: string;
}

export interface AdmissionSummary {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  waitlistedApplications: number;
}

export interface CreatedStudent {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  isActive: boolean;
}

export interface CreatedParent {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  relationship: string;
  studentId: number;
  isActive: boolean;
}