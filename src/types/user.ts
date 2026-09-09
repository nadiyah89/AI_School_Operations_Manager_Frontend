export interface User {
  id: string;
  email: string;
  role: "Admin" | "Student" | "Teacher" | "Parent";
}