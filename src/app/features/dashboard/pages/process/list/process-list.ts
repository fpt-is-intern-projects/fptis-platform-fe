import { Component, type OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type {
  ProcessDefinitionResponse,
  ProcessDeployRequest,
} from '../../../../../models/proccess.model';
import { ProcessManagementService } from '../../../../../services/process-management.service';
import type { ApiResponse } from '../../../../../models/api-response.model';
import { parseProcessFile } from '../../../../../utils/process-parser.utils';

@Component({
  selector: 'app-process-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './process-list.html',
})
export class ProcessList implements OnInit {
  private processService = inject(ProcessManagementService);
  private router = inject(Router);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  processes: ProcessDefinitionResponse[] = [];
  filteredProcesses: ProcessDefinitionResponse[] = [];
  searchTerm = '';
  isLoading = false;

  // Deploy modal
  showDeployModal = false;
  deployForm: ProcessDeployRequest = {
    name: '',
    processCode: '',
    resourceType: 'BPMN',
  };
  uploadedFile: File | null = null;
  isFormAutoFilled = false;
  isDragging = false;

  ngOnInit() {
    this.loadProcesses();
  }

  loadProcesses() {
    this.isLoading = true;
    this.processService.getAllProcesses().subscribe({
      next: (response: ApiResponse<ProcessDefinitionResponse[]>) => {
        console.log('[FPT IS] Loaded processes:', response.result);
        this.processes = response.result;
        this.filteredProcesses = this.processes;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('[FPT IS] Error loading processes:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredProcesses = this.processes;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredProcesses = this.processes.filter(
        (process) =>
          process.name.toLowerCase().includes(term) ||
          process.processCode.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  viewDetail(process: ProcessDefinitionResponse) {
    const subPath = process.resourceType === 'BPMN' ? 'bpmn' : 'dmn';
    this.router.navigate(['/dashboard/processes', process.processCode, subPath]);
  }

  openDeployModal() {
    this.deployForm = {
      name: '',
      processCode: '',
      resourceType: 'BPMN',
    };
    this.uploadedFile = null;
    this.isFormAutoFilled = false;
    this.showDeployModal = true;
  }

  closeDeployModal() {
    this.showDeployModal = false;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      if (
        !file.name.endsWith('.bpmn') &&
        !file.name.endsWith('.dmn') &&
        !file.name.endsWith('.xml')
      ) {
        alert('Chỉ chấp nhận file .bpmn, .dmn hoặc .xml');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File không được vượt quá 10MB');
        return;
      }

      this.uploadedFile = file;

      try {
        const metadata = await parseProcessFile(this.uploadedFile);
        this.deployForm.processCode = metadata.processCode;
        this.deployForm.resourceType = metadata.resourceType;
        this.isFormAutoFilled = true;
        this.cdr.detectChanges();
      } catch (error) {
        console.error('[FPT IS] Error parsing file:', error);
        alert('File không hợp lệ!');
        this.isFormAutoFilled = false;
      }
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File không được vượt quá 10MB');
        input.value = ''; // Reset input
        return;
      }

      this.uploadedFile = file;

      try {
        const metadata = await parseProcessFile(this.uploadedFile);

        this.deployForm.processCode = metadata.processCode;
        this.deployForm.resourceType = metadata.resourceType;

        this.isFormAutoFilled = true;

        this.cdr.detectChanges();
      } catch (error) {
        console.error('[FPT IS] Error parsing file:', error);
        alert('File không hợp lệ!');
        this.isFormAutoFilled = false;
      }
    }
  }

  deployProcess() {
    if (!this.uploadedFile) {
      alert('Vui lòng chọn file BPMN/DMN');
      return;
    }

    if (!this.deployForm.processCode) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.isLoading = true;
    this.processService.deployProcess(this.deployForm, this.uploadedFile).subscribe({
      next: (response: ApiResponse<string>) => {
        console.log('[FPT IS] Deploy success:', response.result);
        alert('Tải quy trình thành công!');
        this.closeDeployModal();
        this.loadProcesses();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('[FPT IS] Deploy error:', error);
        alert('Tải quy trình thất bại!');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
