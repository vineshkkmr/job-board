export type UserRole = 'admin' | 'recruiter' | 'applicant';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  recruiterId: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'closed';
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  resume: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
