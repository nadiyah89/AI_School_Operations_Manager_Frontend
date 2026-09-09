export interface RegisterRequest {
  email: string;
  password: string;
  role: "Student" | "Teacher" | "Parent";
  studentId?: number | null;
  teacherId?: number | null;
  parentId?: number | null;
}