import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { LoginRequest } from '../../../../models/user.model';
import { Router } from '@angular/router';
import { AuthStateService } from '../../../../state/auth-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
})
export class LoginForm {
  private fb = inject(FormBuilder);
  private profileService = inject(UserService);
  private authState = inject(AuthStateService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  // ❗ Không validator
  form = this.fb.group({
    username: [''],
    password: [''],
  });

  onSubmit() {
    const payload = this.form.getRawValue() as LoginRequest;

    this.profileService.login(payload).subscribe({
      next: (res) => {
        if (res.code !== 1000) {
          this.snack.open(res.message ?? 'Sai thông tin đăng nhập', 'Đóng', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          return;
        }

        const token = res.result;
        localStorage.setItem('access_token', token);

        this.profileService.getMe().subscribe({
          next: (me) => {
            this.authState.setUser(me.result);
            this.router.navigateByUrl('/dashboard');
          },
          error: () => {
            this.snack.open('Không lấy được thông tin người dùng', 'Đóng', {
              duration: 2000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          },
        });
      },

      error: (err) => {
        const msg = err.error?.message ?? 'Lỗi kết nối máy chủ';
        this.snack.open(msg, 'Đóng', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
    });
  }
}
