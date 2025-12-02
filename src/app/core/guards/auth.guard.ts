import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../../state/auth-state.service';
import { UserService } from '../../services/user.service';
import { lastValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthStateService);
  const profile = inject(UserService);
  const router = inject(Router);

  const token = localStorage.getItem('access_token');

  if (!token) {
    router.navigate(['/']);
    return false;
  }

  try {
    const res = await lastValueFrom(profile.getMe());

    if (res?.result) {
      auth.setUser(res.result);
      return true;
    }

    router.navigate(['/hoe']);
    return false;
  } catch {
    localStorage.removeItem('access_token');
    auth.clear();

    router.navigate(['/']);
    return false;
  }
};
