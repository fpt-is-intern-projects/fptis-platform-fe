import { Component, signal, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginForm } from './components/login-form/login-form';
import { RegisterForm } from './components/register-form/register-form';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home.page',
  standalone: true,
  imports: [LoginForm, RegisterForm, MatSnackBarModule],
  templateUrl: './home.page.html',
})
export class HomePage {
  mode = signal<'login' | 'register'>('login');

  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  constructor() {
    const nav = this.router.currentNavigation();
    if (nav?.extras?.state?.['forceLogin']) {
      this.mode.set('login');
    }
  }

  showLoginForm() {
    this.mode.set('login');
  }

  showRegisterForm() {
    this.mode.set('register');
  }

  onRegisterSuccess() {
    this.snackBar.open('Đăng ký thành công, vui lòng đăng nhập!', 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
    this.mode.set('login');
  }

  onLoginSuccess() {
    this.snackBar.open('Đăng nhập thành công!', 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
