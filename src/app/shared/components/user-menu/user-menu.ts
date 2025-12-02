import { Component, inject, signal } from '@angular/core';
import { AuthStateService } from '../../../state/auth-state.service';
import { getAvatarLetters } from '../../../utils/avatar.util';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [MatSnackBarModule],
  templateUrl: './user-menu.html',
})
export class UserMenu {
  private auth = inject(AuthStateService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private profileService = inject(UserService);

  menuOpen = signal(false);

  toggle() {
    this.menuOpen.update((v) => !v);
  }

  logout() {
    this.profileService.logout().subscribe({
      next: () => this.afterLogout(),
      error: () => this.afterLogout(),
    });
  }

  private afterLogout() {
    this.auth.clear();
    localStorage.removeItem('access_token');

    this.snackBar.open('Đăng xuất thành công', 'Đóng', {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });

    this.router.navigate(['/home'], {
      state: { forceLogin: true },
    });
  }

  get avatar() {
    const u = this.auth.currentUser();
    return getAvatarLetters(u?.firstName, u?.lastName);
  }
}
