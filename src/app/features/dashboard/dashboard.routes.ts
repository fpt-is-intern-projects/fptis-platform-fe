import type { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'analytics',
    pathMatch: 'full',
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/analytics').then((m) => m.Analytics),
  },
  {
    path: 'attendance',
    loadComponent: () => import('./pages/attendance/attendance').then((m) => m.Attendance),
  },
  {
    path: 'work-log',
    loadComponent: () => import('./pages/daily-log/daily-log').then((m) => m.DailyLog),
  },
  {
    path: 'users-management',
    loadComponent: () =>
      import('./pages/users-management/users-management').then((m) => m.UsersManagement),
  },
];
