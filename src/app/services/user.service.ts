import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { LoginRequest, RemoteUser, RegistrationRequest } from '../models/user.model';
import type { ApiResponse, PageResponse, PaginationParams } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/users';

  getMe() {
    return this.http.get<ApiResponse<RemoteUser>>(`${this.api}/me`);
  }

  login(data: LoginRequest) {
    return this.http.post<ApiResponse<string>>(`${this.api}/login`, data, {
      withCredentials: true,
    });
  }

  refresh() {
    return this.http.post<ApiResponse<string>>(
      `${this.api}/refresh`,
      {},
      {
        withCredentials: true,
      }
    );
  }

  register(data: RegistrationRequest) {
    return this.http.post<ApiResponse<null>>(`${this.api}/register`, data);
  }

  logout() {
    return this.http.post<ApiResponse<null>>(`${this.api}/logout`, {}, { withCredentials: true });
  }

  getAllUsers({ page = 0, size = 10, filter }: PaginationParams) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filter) params.append('filter', filter);

    return this.http.get<ApiResponse<PageResponse<RemoteUser>>>(`${this.api}?${params.toString()}`);
  }
}
