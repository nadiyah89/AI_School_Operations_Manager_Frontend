export interface AttendanceStudent {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  isActive: boolean;
}

export interface Attendance {
  id: number;
  studentId: number;
  date: string;
  isPresent: boolean;
  isActive: boolean;
  student?: AttendanceStudent | null;
}

export interface CreateAttendanceDto {
  studentId: number;
  date: string;
  isPresent: boolean;
}

export interface UpdateAttendanceDto {
  date: string;
  isPresent: boolean;
}

export interface AttendanceSummary {
  studentId: number;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
}