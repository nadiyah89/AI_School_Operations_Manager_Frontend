export interface AcademicPerformance {
  id: number;
  studentId: number;
  subject: string;
  examName: string;
  marksObtained: number;
  maximumMarks: number;
  examDate: string;
  isActive: boolean;
  student?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface PoorPerformanceSummary {
  studentId: number;
  studentName: string;
  subject: string;
  latestExamName: string;
  latestExamDate: string;
  latestPercentage: number;
}

export interface DecliningPerformanceSummary {
  studentId: number;
  studentName: string;
  subject: string;
  previousExamName: string;
  previousExamDate: string;
  previousPercentage: number;
  latestExamName: string;
  latestExamDate: string;
  latestPercentage: number;
  percentageChange: number;
}

export interface CreateAcademicPerformanceRequest {
  studentId: number;
  subject: string;
  examName: string;
  marksObtained: number;
  maximumMarks: number;
  examDate: string;
}

export interface UpdateAcademicPerformanceRequest {
  subject: string;
  examName: string;
  marksObtained: number;
  maximumMarks: number;
  examDate: string;
}