import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, from, tap, map, finalize } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../services/user.service';
import type { ApiResponse as ApiResponseModel } from '../models/api-response.model';
import type { RemoteUser } from '../models/user.model';

interface JwtPayload {
  realm_access?: {
    roles?: string[];
  };
  [key: string]: any;
}

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const userService = inject(UserService);
  const router = inject(Router);

  const isAuthEndpoint =
    req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/refresh');

  let newReq = req;

  if (token && !isAuthEndpoint) {
    newReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
  } else {
    newReq = req.clone({
      withCredentials: true,
    });
  }

  return next(newReq).pipe(
    map((event: any) => {
      if (event instanceof HttpResponse && req.url.includes('/me') && event.body?.code === 1000) {
        const currentToken = localStorage.getItem('access_token');
        if (currentToken) {
          try {
            const decodedToken = jwtDecode<JwtPayload>(currentToken);
            if (decodedToken?.realm_access?.roles) {
              const modifiedBody: ApiResponseModel<RemoteUser> = {
                ...event.body,
                result: {
                  ...event.body.result,
                  roles: decodedToken.realm_access.roles,
                },
              };
              return event.clone({ body: modifiedBody });
            }
          } catch (e) {
            console.error('[FPS IS] Failed to decode token:', e);
          }
        }
      }
      return event;
    }),

    tap((event: any) => {
      if (event instanceof HttpResponse && event.body?.code === 1012) {
        console.warn('[FPS IS] Token expired (code 1012) in response body, triggering refresh...');
        throw { status: 401, error: event.body };
      }
    }),

    catchError((error: any) => {
      const isTokenExpired =
        (error instanceof HttpErrorResponse && error.status === 401) ||
        error?.code === 1012 ||
        (error instanceof HttpErrorResponse && error.error?.code === 1012);

      if (isTokenExpired) {
        // --- TRƯỜNG HỢP 1: LỖI XẢY RA TẠI CHÍNH ENDPOINT REFRESH ---
        // Nếu đã gọi refresh mà vẫn trả về 401/1012 => Refresh Token cũng hết hạn => Logout
        if (req.url.includes('/refresh')) {
          console.error('[FPS IS] Refresh token is invalid or expired. Force logging out...');
          isRefreshing = false;
          refreshQueue = [];
          localStorage.removeItem('access_token');
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }

        // --- TRƯỜNG HỢP 2: ĐANG TRONG QUÁ TRÌNH REFRESH ---
        // Nếu có request khác đến trong khi đang refresh, đưa vào hàng đợi
        if (isRefreshing) {
          console.log('[FPS IS] Refresh in progress, queueing request:', req.url);
          return from(
            new Promise<void>((resolve) => {
              refreshQueue.push(() => resolve());
            })
          ).pipe(
            switchMap(() => {
              const retryToken = localStorage.getItem('access_token');
              return next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${retryToken}` },
                  withCredentials: true,
                })
              );
            })
          );
        }

        // --- TRƯỜNG HỢP 3: BẮT ĐẦU QUÁ TRÌNH REFRESH ---
        console.log('[FPS IS] Access token expired, attempting to refresh...');
        isRefreshing = true;

        return userService.refresh().pipe(
          switchMap((response: ApiResponseModel<string>) => {
            console.log('[FPS IS] Token refresh successful');

            localStorage.setItem('access_token', response.result);
            isRefreshing = false;

            refreshQueue.forEach((callback) => callback());
            refreshQueue = [];

            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${response.result}` },
                withCredentials: true,
              })
            );
          }),
          catchError((refreshError) => {
            console.error('[FPS IS] Token refresh failed technical error, logging out...');
            isRefreshing = false;
            refreshQueue = [];
            localStorage.removeItem('access_token');
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // Các lỗi khác không liên quan đến Token
      return throwError(() => error);
    })
  );
};
