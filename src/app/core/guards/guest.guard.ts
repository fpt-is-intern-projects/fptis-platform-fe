import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../../state/auth-state.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);

  const token = localStorage.getItem('access_token');

  if (token || auth.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
