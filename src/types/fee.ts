export interface FeeStudent {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  isActive: boolean;
}

export interface FeeRecord {
  id: number;
  studentId: number;
  feeType: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  paymentDate: string | null;
  status: "Pending" | "Partially Paid" | "Paid";
  isActive: boolean;
  student?: FeeStudent | null;
}

export interface CreateFeeRecordDto {
  studentId: number;
  feeType: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  paymentDate: string | null;
}

export interface UpdateFeeRecordDto {
  feeType: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  paymentDate: string | null;
}

export interface FeeSummary {
  totalFeeRecords: number;
  totalFeeAmount: number;
  totalPaidAmount: number;
  totalOutstandingAmount: number;
  pendingFeeRecords: number;
  partiallyPaidFeeRecords: number;
  paidFeeRecords: number;
  overdueFeeRecords: number;
}

export interface OutstandingFee {
  feeRecordId: number;
  studentId: number;
  studentName: string;
  feeType: string;
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  status: "Pending" | "Partially Paid" | "Paid";
}