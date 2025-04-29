import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStore } from '@app/app.store';

export function authGuardAuthenticated(): CanActivateFn {
  return () => {
    const router = inject(Router);
    const store = inject(AppStore);

    if (!store.user()) {
      return true;
    }
    router.navigate(['/home']);
    return false;
  };
}

export function authGuardNotAuthenticated(): CanActivateFn {
  return () => {
    const router = inject(Router);
    const store = inject(AppStore);

    if (store.user()) {
      return true;
    }
    router.navigate(['/login']);
    return false;
  };
}
