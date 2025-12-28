import { Component, type OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ProcessDefinitionResponse,
  ProcessDeployRequest,
} from '../../../../../models/proccess.model';
import { ProcessManagementService } from '../../../../../services/process-management.service';
import { ApiResponse } from '../../../../../models/api-response.model';
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

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedFile = input.files[0];
      console.log('[FPT IS] File selected:', this.uploadedFile.name);

      try {
        const metadata = await parseProcessFile(this.uploadedFile);

        this.deployForm.name = metadata.processName;
        this.deployForm.processCode = metadata.processName.toUpperCase().replace(/\s+/g, '_');
        this.deployForm.resourceType = metadata.resourceType;

        this.isFormAutoFilled = true;

        console.log('[FPT IS] Auto-filled form from file:', this.deployForm);
        this.cdr.detectChanges();
      } catch (error) {
        console.error('[FPT IS] Error parsing process file:', error);
        alert('Không thể đọc file. Vui lòng kiểm tra lại file BPMN/DMN.');
        this.uploadedFile = null;
        this.isFormAutoFilled = false;
      }
    }
  }

  deployProcess() {
    if (!this.uploadedFile) {
      alert('Vui lòng chọn file BPMN/DMN');
      return;
    }

    if (!this.deployForm.name || !this.deployForm.processCode) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.isLoading = true;
    this.processService.deployProcess(this.deployForm, this.uploadedFile).subscribe({
      next: (response: ApiResponse<string>) => {
        console.log('[FPT IS] Deploy success:', response.result);
        alert('Xuất quy trình thành công!');
        this.closeDeployModal();
        this.loadProcesses();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('[FPT IS] Deploy error:', error);
        alert('Xuất quy trình thất bại!');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
