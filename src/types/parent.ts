export interface ParentStudent {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  isActive: boolean;
}

export interface Parent {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  relationship: string;
  studentId: number;
  isActive: boolean;
  student: ParentStudent | null;
}

export interface CreateParentRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  relationship: string;
  studentId: number;
}

export interface UpdateParentRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  relationship: string;
}