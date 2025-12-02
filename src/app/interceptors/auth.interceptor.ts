import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, from, tap, map } from 'rxjs';
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
  } else if (isAuthEndpoint) {
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
            console.error('Failed to decode token:', e);
          }
        }
      }
      return event;
    }),
    tap((event: any) => {
      if (event instanceof HttpResponse && event.body?.code === 1012) {
        console.log('Token expired (code 1012) in response body, throwing error...');
        throw event.body;
      }
    }),
    catchError((error: any) => {
      const isTokenExpired =
        (error instanceof HttpErrorResponse && error.status === 401) ||
        error?.code === 1012 ||
        (error instanceof HttpErrorResponse && error.error?.code === 1012);

      if (isTokenExpired) {
        console.log('Token expired, attempting refresh...');

        if (isRefreshing) {
          console.log('Refresh in progress, queueing request...');
          return from(
            new Promise<void>((resolve) => {
              refreshQueue.push(() => resolve());
            })
          ).pipe(
            switchMap(() => {
              const retryToken = localStorage.getItem('access_token');
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${retryToken}`,
                },
                withCredentials: true,
              });
              return next(retryReq);
            })
          );
        }

        isRefreshing = true;

        return userService.refresh().pipe(
          switchMap((response: ApiResponseModel<string>) => {
            console.log('Token refresh successful');

            localStorage.setItem('access_token', response.result);

            refreshQueue.forEach((callback) => callback());
            refreshQueue = [];
            isRefreshing = false;

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.result}`,
              },
              withCredentials: true,
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            console.log('Token refresh failed, logging out...');

            refreshQueue = [];
            isRefreshing = false;

            localStorage.removeItem('access_token');
            router.navigate(['/auth/login']);

            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
