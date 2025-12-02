import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiResponse, PageResponse, PaginationParams } from '../models/api-response.model';
import type {
  CreateDailyLogRequest,
  DailyLogResponse,
  UpdateDailyLogRequest,
} from '../models/daily-log.model';

@Injectable({ providedIn: 'root' })
export class DailyLogService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/daily-logs';

  getCurrentUserDailyLogs({ page = 0, size = 10, filter }: PaginationParams) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filter) params.append('filter', filter);

    return this.http.get<ApiResponse<PageResponse<DailyLogResponse>>>(
      `${this.api}?${params.toString()}`
    );
  }

  getDailyLogById(id: number) {
    return this.http.get<ApiResponse<DailyLogResponse>>(`${this.api}/${id}`, {
      withCredentials: true,
    });
  }

  createDailyLog(data: CreateDailyLogRequest) {
    return this.http.post<ApiResponse<DailyLogResponse>>(this.api, data);
  }

  updateDailyLog(id: number, data: UpdateDailyLogRequest) {
    return this.http.put<ApiResponse<DailyLogResponse>>(`${this.api}/${id}`, data);
  }

  deleteDailyLog(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`, { withCredentials: true });
  }
}
