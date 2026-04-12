// ── Auth ─────────────────────────────────────────────────────
export interface User {
  userId: string;
  email: string;
  fullName: string;
  resumeUrl: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
}

// ── Job ──────────────────────────────────────────────────────
export type Channel = 1 | 2 | 3; // 1=Email 2=WhatsApp 3=Both

export interface Job {
  jobId: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string;
  contactEmail: string;
  contactPhone: string;
  channel: Channel;
  createdAt: string;
  applicationStatus: number | null;
  applicationSentAt: string | null;
  applicationId: string | null;
}

export interface JobFormRow {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  contactEmail: string;
  contactPhone: string;
  channel: Channel;
}

// ── Application ───────────────────────────────────────────────
export type AppStatus = 0 | 1 | 2 | 3; // Pending Sent Failed Opened

export interface Application {
  applicationId: string;
  jobId: string;
  companyName: string;
  jobTitle: string;
  contactEmail: string;
  contactPhone: string;
  channel: Channel;
  channelLabel: string;
  status: AppStatus;
  statusLabel: string;
  emailSubject: string | null;
  whatsAppMsg: string | null;
  sentAt: string | null;
  retryCount: number;
  errorMsg: string | null;
  createdAt: string;
}

export interface AppStats {
  Total: number;
  Pending: number;
  Sent: number;
  Failed: number;
  Opened: number;
  EmailsSent: number;
  WhatsAppSent: number;
}

// ── Template ─────────────────────────────────────────────────
export interface Template {
  templateId: string;
  name: string;
  channel: Channel;
  tone: 'formal' | 'semiformal' | 'casual';
  subjectTemplate: string | null;
  bodyTemplate: string;
  isDefault: boolean;
  createdAt: string;
}

// ── AI ───────────────────────────────────────────────────────
export interface ResumeProfile {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: { company: string; role: string; duration: string; highlights: string[] }[];
  education: { degree: string; institution: string; year: string }[];
  totalYearsExp: number;
}

export interface GeneratedContent {
  jobId: string;
  success: boolean;
  emailSubject?: string;
  emailBody?: string;
  whatsappMessage?: string;
  error?: string;
}

// ── API Response wrapper ──────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
