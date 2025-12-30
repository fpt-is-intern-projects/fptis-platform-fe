import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiResponse } from '../models/api-response.model';
import {
  ProcessDefinitionResponse,
  ProcessDeployRequest,
  ProcessTaskResponse,
  ProcessVariableResponse,
  TaskActionsUpdateRequest,
  TaskPermissionRequest,
} from '../models/proccess.model';

@Injectable({ providedIn: 'root' })
export class ProcessManagementService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/processes';

  getProcessXml(processCode: string) {
    return this.http.get<ApiResponse<string>>(`${this.api}/${processCode}/xml`);
  }

  deployProcess(request: ProcessDeployRequest, file: File) {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${this.api}/deploy`, formData);
  }

  getTasksByCode(processCode: string) {
    return this.http.get<ApiResponse<ProcessTaskResponse[]>>(`${this.api}/${processCode}/tasks`);
  }

  getVariablesByCode(processCode: string) {
    return this.http.get<ApiResponse<ProcessVariableResponse[]>>(
      `${this.api}/${processCode}/variables`
    );
  }

  getAllProcesses() {
    return this.http.get<ApiResponse<ProcessDefinitionResponse[]>>(`${this.api}/all`);
  }

  updatePermission(data: TaskPermissionRequest) {
    return this.http.put<ApiResponse<string>>(`${this.api}/tasks/permission`, data);
  }

  updateActions(data: TaskActionsUpdateRequest) {
    return this.http.put<ApiResponse<string>>(`${this.api}/tasks/actions`, data);
  }
}
