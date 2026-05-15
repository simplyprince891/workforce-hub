import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'employees', 
    loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'employees/add', 
    loadComponent: () => import('./pages/employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'employees/edit/:id', 
    loadComponent: () => import('./pages/employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'tasks', 
    loadComponent: () => import('./pages/tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'tasks/:id', 
    loadComponent: () => import('./pages/task-detail/task-detail.component').then(m => m.TaskDetailComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'payroll', 
    loadComponent: () => import('./pages/payroll/payroll.component').then(m => m.PayrollComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'payroll/:id', 
    loadComponent: () => import('./pages/payslip/payslip.component').then(m => m.PayslipComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'leaves', 
    loadComponent: () => import('./pages/leaves/leaves.component').then(m => m.LeavesComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'teams', 
    loadComponent: () => import('./pages/teams/teams.component').then(m => m.TeamsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'attendance', 
    loadComponent: () => import('./pages/attendance/attendance.component').then(m => m.AttendanceComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];