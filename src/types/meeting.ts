export type MeetingStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled";

export interface MeetingStudent {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  isActive: boolean;
}

export interface MeetingTeacher {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
}

export interface Meeting {
  id: number;
  studentId: number;
  teacherId: number;
  meetingDate: string;
  purpose: string;
  status: MeetingStatus;
  notes: string | null;
  isActive: boolean;
  student?: MeetingStudent | null;
  teacher?: MeetingTeacher | null;
}

export interface MeetingSummary {
  id: number;
  studentId: number;
  studentName: string;
  teacherId: number;
  teacherName: string;
  meetingDate: string;
  purpose: string;
  status: MeetingStatus;
}

export interface CreateMeetingDto {
  studentId: number;
  teacherId: number;
  meetingDate: string;
  purpose: string;
  notes?: string | null;
}

export interface UpdateMeetingDto {
  meetingDate: string;
  purpose: string;
  notes?: string | null;
  status: MeetingStatus;
}