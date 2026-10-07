export type NotificationChannel = "SMS" | "Email";

export type NotificationStatus =
  | "Pending"
  | "Sent"
  | "Failed";

export interface NotificationStudent {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  isActive: boolean;
}

export interface NotificationParent {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  relationship: string;
  studentId: number;
  isActive: boolean;
}

export interface Notification {
  id: number;
  studentId: number;
  parentId: number;
  notificationType: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  createdAt: string;
  sentAt: string | null;
  isActive: boolean;
  student?: NotificationStudent | null;
  parent?: NotificationParent | null;
}

export interface CreateNotificationDto {
  studentId: number;
  parentId: number;
  notificationType: string;
  message: string;
  channel: NotificationChannel;
}

export interface UpdateNotificationDto {
  notificationType: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt?: string | null;
}