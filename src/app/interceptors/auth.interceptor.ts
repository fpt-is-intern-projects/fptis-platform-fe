import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { UserService } from '../services/user.service';
import { AuthStateService } from '../state/auth-state.service';
import type { ApiResponse as ApiResponseModel } from '../models/api-response.model';

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const userService = inject(UserService);
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const isAuthEndpoint =
    req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/refresh');

  const authReq = req.clone({
    setHeaders: token && !isAuthEndpoint ? { Authorization: `Bearer ${token}` } : {},
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: any) => {
      const isTokenExpired =
        (error instanceof HttpErrorResponse && error.status === 401) ||
        error?.code === 1012 ||
        error?.error?.code === 1012;

      if (!isTokenExpired) {
        return throwError(() => error);
      }

      // ❌ refresh cũng fail → logout
      if (req.url.includes('/refresh')) {
        isRefreshing = false;
        refreshQueue = [];
        authState.clear();
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      // ⏳ đang refresh → chờ
      if (isRefreshing) {
        return from(new Promise<void>((resolve) => refreshQueue.push(resolve))).pipe(
          switchMap(() =>
            next(
              req.clone({
                setHeaders: {
                  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                withCredentials: true,
              })
            )
          )
        );
      }

      // 🔄 bắt đầu refresh
      isRefreshing = true;
      return userService.refresh().pipe(
        switchMap((response: ApiResponseModel<string>) => {
          localStorage.setItem('access_token', response.result);
          isRefreshing = false;
          refreshQueue.forEach((cb) => cb());
          refreshQueue = [];

          return next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${response.result}` },
              withCredentials: true,
            })
          );
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          refreshQueue = [];
          authState.clear();
          router.navigate(['/auth/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
