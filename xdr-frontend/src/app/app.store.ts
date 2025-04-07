import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, patchState, withMethods } from '@ngrx/signals';

export interface User {
  username: string;
  image?: string;
}

type AppState = { user: User | undefined };

const initialState: AppState = { user: undefined };

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, router = inject(Router)) => ({
    login: () => {
      patchState(store, { user: { username: 'admin' } });
      router.navigate(['/home']);
    },
    logout: () => {
      patchState(store, { user: undefined });
      router.navigate(['/login']);
    },
  })),
);
