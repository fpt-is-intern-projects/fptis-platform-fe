import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import type { RegistrationRequest } from '../../../../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-form.html',
})
export class RegisterForm {
  private fb = inject(FormBuilder);
  private profileService = inject(UserService);
  private snack = inject(MatSnackBar);
  private cd = inject(ChangeDetectorRef);

  @Output() success = new EventEmitter<void>();

  isSubmitting = false;

  form = this.fb.group({
    username: [''],
    password: [''],
    email: [''],
    firstName: [''],
    lastName: [''],
    dob: [''],
  });

  onSubmit() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.cd.detectChanges();

    const payload = this.form.getRawValue() as RegistrationRequest;

    this.profileService.register(payload).subscribe({
      next: (res) => {
        if (res.code !== 1000) {
          this.snack.open(res.message ?? 'Đăng ký thất bại', 'Đóng', {
            duration: 2500,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });

          this.isSubmitting = false;
          this.cd.detectChanges();
          return;
        }

        this.success.emit();
        this.isSubmitting = false;
        this.cd.detectChanges();
      },

      error: (err) => {
        const msg = err.error?.message ?? 'Lỗi đăng ký!';
        this.snack.open(msg, 'Đóng', {
          duration: 2500,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        this.isSubmitting = false;
        this.cd.detectChanges();
      },
    });
  }
}
