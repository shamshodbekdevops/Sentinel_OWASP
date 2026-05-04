import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewScanPage } from './pages/NewScanPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { ReportsPage } from './pages/ReportsPage';

export const router = createBrowserRouter([
  {
    path: '/auth',
    Component: AuthLayout,
    children: [
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
    ],
  },
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', Component: DashboardPage },
      { path: 'scan/new', Component: NewScanPage },
      { path: 'scan/history', Component: ScanHistoryPage },
      { path: 'reports', Component: ReportsPage },
    ],
  },
]);
