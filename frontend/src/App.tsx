import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage    from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import ResumePage   from './pages/ResumePage.tsx';
import JobsPage     from './pages/JobsPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ProtectedRoute from './components/layout/ProtectedRoute.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/resume" element={
            <ProtectedRoute><ResumePage /></ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute><JobsPage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />

          {/* Default */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
