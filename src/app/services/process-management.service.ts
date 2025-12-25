import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiResponse } from '../models/api-response.model';
import {
  ProcessDefinitionResponse,
  ProcessDeployRequest,
  ProcessTaskResponse,
} from '../models/proccess.model';

@Injectable({ providedIn: 'root' })
export class ProcessManagementService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/processes';

  deployProcess(request: ProcessDeployRequest, file: File) {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${this.api}/deloy`, formData);
  }

  getTasksByCode(processCode: string) {
    return this.http.get<ApiResponse<ProcessTaskResponse[]>>(`${this.api}/${processCode}/tasks`);
  }

  getAllProcesses() {
    return this.http.get<ApiResponse<ProcessDefinitionResponse[]>>(`${this.api}/all`);
  }
}
