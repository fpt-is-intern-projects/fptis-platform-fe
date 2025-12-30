import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiResponse } from '../models/api-response.model';
import {
  MentorReviewRequest,
  MentorTaskResponse,
  WorkRequestRequest,
  WorkRequestResponse,
} from '../models/work-request.model';
import { TaskCompleteRequest } from '../models/proccess.model';

@Injectable({ providedIn: 'root' })
export class WorkRequestService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  createRequest(data: WorkRequestRequest) {
    return this.http.post<ApiResponse<string>>(`${this.api}/intern/work-requests`, data);
  }

  getMyHistory() {
    return this.http.get<ApiResponse<WorkRequestResponse[]>>(`${this.api}/intern/work-requests`);
  }

  getPendingTasks() {
    return this.http.get<ApiResponse<MentorTaskResponse[]>>(`${this.api}/mentor/work-requests`);
  }

  completeTask(data: TaskCompleteRequest) {
    return this.http.post<ApiResponse<string>>(`${this.api}/mentor/work-requests`, data);
  }
}
