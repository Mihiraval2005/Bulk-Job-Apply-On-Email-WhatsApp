import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.ts';
import { useAuthStore } from '../store/auth.store.ts';
import type {
  LoginForm, RegisterForm, AuthResponse,
  Job, JobFormRow, Application, AppStats,
  Template, ResumeProfile, GeneratedContent,
} from '../types';

// ── Auth ─────────────────────────────────────────────────────
export const useLogin = () => {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (data: LoginForm) =>
      api.post<{ data: AuthResponse }>('/auth/login', data).then((r) => r.data.data),
    onSuccess: (data) => login(data.token, data.user),
  });
};

export const useRegister = () => {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (data: RegisterForm) =>
      api.post<{ data: AuthResponse }>('/auth/register', data).then((r) => r.data.data),
    onSuccess: (data) => login(data.token, data.user),
  });
};

// ── Resume ───────────────────────────────────────────────────
export const useUploadResume = () => {
  const updateUser = useAuthStore((s) => s.updateUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('resume', file);
      return api.post<{ data: { resumeUrl: string } }>('/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data.data);
    },
    onSuccess: (data) => {
      updateUser({ resumeUrl: data.resumeUrl });
      qc.invalidateQueries({ queryKey: ['resumeProfile'] });
    },
  });
};

export const useParseResume = () =>
  useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('resume', file);
      return api.post<{ data: ResumeProfile }>('/ai/parse-resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data.data);
    },
  });

// ── Jobs ─────────────────────────────────────────────────────
export const useJobs = () =>
  useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get<{ data: Job[] }>('/jobs').then((r) => r.data.data),
  });

export const useBulkInsertJobs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobs: JobFormRow[]) =>
      api.post<{ data: Job[] }>('/jobs/bulk', { jobs }).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
};

// ── AI Content Generation ─────────────────────────────────────
export const useGenerateContent = () =>
  useMutation({
    mutationFn: (payload: {
      jobs: Job[];
      resumeProfile: ResumeProfile;
      tone: string;
    }) =>
      api.post<{ data: GeneratedContent[] }>('/ai/generate-content', payload)
        .then((r) => r.data.data),
  });

// ── Applications ──────────────────────────────────────────────
export const useApplications = () =>
  useQuery({
    queryKey: ['applications'],
    queryFn: () =>
      api.get<{ data: Application[] }>('/apply').then((r) => r.data.data),
    refetchInterval: 5000, // auto-refresh every 5s
  });

export const useAppStats = () =>
  useQuery({
    queryKey: ['appStats'],
    queryFn: () =>
      api.get<{ data: AppStats }>('/apply/stats').then((r) => r.data.data),
    refetchInterval: 5000,
  });

export const useBulkApply = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applications: object[]) =>
      api.post('/apply/bulk', { applications }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['appStats'] });
    },
  });
};

export const useRetryApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/apply/${id}/retry`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
};

// ── Templates ─────────────────────────────────────────────────
export const useTemplates = () =>
  useQuery({
    queryKey: ['templates'],
    queryFn: () =>
      api.get<{ data: Template[] }>('/templates').then((r) => r.data.data),
  });

export const useCreateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Template>) =>
      api.post<{ data: Template }>('/templates', data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
};

export const useDeleteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/templates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
};
