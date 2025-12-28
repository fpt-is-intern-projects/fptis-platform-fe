import { Component, type OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcessManagementService } from '../../../../../services/process-management.service';
import {
  ProcessDefinitionResponse,
  ProcessTaskResponse,
} from '../../../../../models/proccess.model';
import { ApiResponse } from '../../../../../models/api-response.model';

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
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadTasks() {
    this.isLoading = true;
    this.processService.getTasksByCode(this.processCode).subscribe({
      next: (response: ApiResponse<ProcessTaskResponse[]>) => {
        this.tasks = response.result;
        this.filteredTasks = this.tasks;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('[FPT IS] Error loading tasks:', error);
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

  viewTask(task: ProcessTaskResponse) {
    console.log('[FPT IS] View task:', task);
  }

  editTask(task: ProcessTaskResponse) {
    this.editingTask = { ...task };
    this.showEditDrawer = true;
    this.editActiveTab = 'permissions';
    this.cdr.detectChanges();
  }

  deleteTask(task: ProcessTaskResponse) {
    if (confirm(`Bạn có chắc muốn xóa task "${task.taskName}"?`)) {
      console.log('[FPT IS] Delete task:', task);
    }
  }

  closeEditDrawer() {
    this.showEditDrawer = false;
    this.editingTask = null;
  }

  setEditTab(tab: 'permissions' | 'buttons') {
    this.editActiveTab = tab;
  }

  saveTaskConfig() {
    console.log('[FPT IS] Save task config:', this.editingTask);
    this.closeEditDrawer();
  }

  goBack() {
    this.router.navigate(['/dashboard/processes']);
  }
}
