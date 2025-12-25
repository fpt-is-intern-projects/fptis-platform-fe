import type { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main').then((m) => m.Main),
  },
  {
    path: 'work-log',
    loadComponent: () => import('./pages/daily-log/daily-log').then((m) => m.DailyLog),
  },
  {
    path: 'attendance',
    loadComponent: () => import('./pages/attendance/attendance').then((m) => m.Attendance),
  },

  // ==========================================
  // WORK REQUEST (INTERN SIDE)
  // ==========================================
  {
    path: 'work-request',
    redirectTo: 'work-request/list',
    pathMatch: 'full',
  },
  {
    path: 'work-request/form',
    loadComponent: () =>
      import('./pages/work-request/form/work-request-form').then((m) => m.WorkRequestForm),
  },
  {
    path: 'work-request/list',
    loadComponent: () =>
      import('./pages/work-request/list/work-request-list').then((m) => m.WorkRequestList),
  },

  // ==========================================
  // MANAGER SECTION (MENTOR/ADMIN SIDE)
  // ==========================================
  {
    path: 'work-request-manager',
    loadComponent: () =>
      import('./pages/work-request-manager/list/work-request-manager-list').then(
        (m) => m.WorkRequestManagerList
      ),
  },
  {
    path: 'users-management',
    loadComponent: () =>
      import('./pages/users-management/users-management').then((m) => m.UsersManagement),
  },
  {
    path: 'processes',
    loadComponent: () => import('./pages/process-list/process-list').then((m) => m.ProcessList),
  },
  {
    path: 'processes/:code',
    loadComponent: () =>
      import('./pages/process-management/process-management').then((m) => m.ProcessManagement),
  },
];
