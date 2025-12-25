import { Component, type OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProcessManagementService } from '../../../../services/process-management.service';
import type { ApiResponse } from '../../../../models/api-response.model';
import { ProcessTaskResponse } from '../../../../models/proccess.model';

type TabType = 'status' | 'diagram' | 'dmn' | 'settings';

@Component({
  selector: 'app-process-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './process-management.html',
})
export class ProcessManagement implements OnInit {
  private processService = inject(ProcessManagementService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  // Tab state
  activeTab: TabType = 'status';

  processName = '';
  processCode = '';
  isProcessActive = true;

  // Tasks data
  tasks: ProcessTaskResponse[] = [];
  filteredTasks: ProcessTaskResponse[] = [];
  searchTerm = '';
  isLoading = false;

  // Modal states
  showDeployModal = false;
  showEditDrawer = false;
  editingTask: ProcessTaskResponse | null = null;
  editActiveTab: 'permissions' | 'buttons' = 'permissions';

  // Deploy form
  deployForm: any = {
    name: '',
    processCode: '',
    camundaProcessKey: '',
    description: '',
  };
  uploadedFile: File | null = null;

  constructor() // private cdr: ChangeDetectorRef, // private processService: ProcessManagementService,
  {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.processCode = params['code'];
      console.log('[FPT IS] Loading process detail for code:', this.processCode);
      this.loadTasks();
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

  // Tab navigation
  setActiveTab(tab: TabType) {
    this.activeTab = tab;
  }

  // Search
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

  // Toggle task status
  toggleTaskStatus(task: ProcessTaskResponse) {
    task.isActive = !task.isActive;
    console.log('[FPT IS] Task status toggled:', task);
    this.cdr.detectChanges();
    // TODO: Call API to update status
  }

  // Actions
  viewTask(task: ProcessTaskResponse) {
    console.log('[FPT IS] View task:', task);
    // TODO: Implement view logic
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
      // TODO: Call API to delete
    }
  }

  // Deploy modal
  openDeployModal() {
    this.deployForm = {
      name: '',
      processCode: '',
      camundaProcessKey: '',
      description: '',
    };
    this.uploadedFile = null;
    this.showDeployModal = true;
  }

  closeDeployModal() {
    this.showDeployModal = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedFile = input.files[0];
    }
  }

  deployProcess() {
    if (!this.uploadedFile) {
      alert('Vui lòng chọn file BPMN/DMN');
      return;
    }

    this.isLoading = true;
    this.processService.deployProcess(this.deployForm, this.uploadedFile).subscribe({
      next: (response: ApiResponse<string>) => {
        console.log('[FPT IS] Deploy success:', response.result);
        alert('Xuất quy trình thành công!');
        this.closeDeployModal();
        this.loadTasks();
        this.isLoading = false;
      },
      error: (error) => {
        console.log('[FPT IS] Deploy error:', error);
        alert('Xuất quy trình thất bại!');
        this.isLoading = false;
      },
    });
  }

  // Edit drawer
  closeEditDrawer() {
    this.showEditDrawer = false;
    this.editingTask = null;
  }

  setEditTab(tab: 'permissions' | 'buttons') {
    this.editActiveTab = tab;
  }

  saveTaskConfig() {
    console.log('[FPT IS] Save task config:', this.editingTask);
    // TODO: Call API to save
    this.closeEditDrawer();
  }
}
