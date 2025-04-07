import { Routes } from '@angular/router';
import {
  authGuardAuthenticated,
  authGuardNotAuthenticated,
} from './guards/auth';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component'),
    title: 'Inicio de Sesión',
    canActivate: [authGuardAuthenticated()],
  },
  {
    path: '',
    loadComponent: () => import('./pages/layout/layout.component'),
    canActivate: [authGuardNotAuthenticated()],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/inicio/inicio.component'),
        title: 'Inicio',
      },
    ],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
