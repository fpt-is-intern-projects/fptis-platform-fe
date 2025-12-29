import { Component, type OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcessManagementService } from '../../../../../services/process-management.service';
import { AlertService } from '../../../../../services/alert.service';
import type {
  ProcessDefinitionResponse,
  ProcessTaskResponse,
  TaskPermissionRequest,
} from '../../../../../models/proccess.model';
import type { ApiResponse } from '../../../../../models/api-response.model';

type TabType = 'status' | 'diagram' | 'settings';

@Component({
  selector: 'app-bpmn-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bpmn-management.html',
})
export class BpmnManagement implements OnInit {
  private processService = inject(ProcessManagementService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private alertService = inject(AlertService);

  activeTab: TabType = 'status';
  processName = '';
  processCode = '';
  isProcessActive = true;

  tasks: ProcessTaskResponse[] = [];
  filteredTasks: ProcessTaskResponse[] = [];

  searchTerm = '';
  isLoading = false;

  showEditDrawer = false;
  editingTask: ProcessTaskResponse | null = null;
  editActiveTab: 'permissions' | 'buttons' = 'permissions';

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.processCode = params['code'];
      console.log('[FPT IS] Loading BPMN process:', this.processCode);
      this.loadProcessDefinition();
    });
  }

  loadProcessDefinition() {
    this.isLoading = true;
    this.processService.getAllProcesses().subscribe({
      next: (response: ApiResponse<ProcessDefinitionResponse[]>) => {
        if (response.message) {
          this.alertService.error(response.message);
        }
        const process = response.result.find((p) => p.processCode === this.processCode);
        if (process) {
          this.processName = process.name;
          this.isProcessActive = process.status === 'ACTIVE';
          this.loadTasks();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('[FPT IS] Error loading process definition:', error);
        this.alertService.error(error?.error?.message || 'Không thể tải thông tin quy trình');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadTasks() {
    this.isLoading = true;
    this.processService.getTasksByCode(this.processCode).subscribe({
      next: (response: ApiResponse<ProcessTaskResponse[]>) => {
        if (response.message) {
          this.alertService.error(response.message);
        }
        this.tasks = response.result;
        this.filteredTasks = this.tasks;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('[FPT IS] Error loading tasks:', error);
        this.alertService.error(error?.error?.message || 'Không thể tải danh sách task');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setActiveTab(tab: TabType) {
    this.activeTab = tab;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter((task) =>
        task.taskName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.cdr.detectChanges();
  }

  toggleTaskStatus(task: ProcessTaskResponse) {
    task.isActive = !task.isActive;
    console.log('[FPT IS] Task status toggled:', task);
    this.cdr.detectChanges();
  }

  editTask(task: ProcessTaskResponse) {
    this.editingTask = { ...task };
    this.showEditDrawer = true;
    this.editActiveTab = 'permissions';
    this.cdr.detectChanges();
  }

  closeEditDrawer() {
    this.showEditDrawer = false;
    this.editingTask = null;
  }

  setEditTab(tab: 'permissions' | 'buttons') {
    this.editActiveTab = tab;
  }

  saveTaskConfig() {
    if (!this.editingTask) return;

    this.isLoading = true;

    const request: TaskPermissionRequest = {
      processCode: this.processCode,
      taskCode: this.editingTask.taskCode,
      permissionRole: this.editingTask.permission || '',
    };

    console.log('[FPT IS] Updating task permission:', request);

    this.processService.updatePermission(request).subscribe({
      next: (response: ApiResponse<string>) => {
        console.log('[FPT IS] Permission updated successfully:', response);
        if (response.message) {
          this.alertService.error(response.message);
        } else {
          this.alertService.success('Cập nhật quyền thành công');
        }
        const taskIndex = this.tasks.findIndex((t) => t.taskCode === this.editingTask!.taskCode);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = { ...this.editingTask! };
          this.onSearch();
        }
        this.closeEditDrawer();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('[FPT IS] Error updating permission:', error);
        this.alertService.error(error?.error?.message || 'Không thể cập nhật quyền');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/processes']);
  }
}
