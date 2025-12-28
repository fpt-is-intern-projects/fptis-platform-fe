import { Component, type OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcessManagementService } from '../../../../../services/process-management.service';
import {
  ProcessDefinitionResponse,
  ProcessVariableResponse,
} from '../../../../../models/proccess.model';
import { ApiResponse } from '../../../../../models/api-response.model';

type TabType = 'variables' | 'diagram' | 'settings';

@Component({
  selector: 'app-dmn-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dmn-management.html',
})
export class DmnManagement implements OnInit {
  private processService = inject(ProcessManagementService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  activeTab: TabType = 'variables';
  processName = '';
  processCode = '';
  isProcessActive = true;

  variables: ProcessVariableResponse[] = [];
  isLoading = false;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.processCode = params['code'];
      console.log('[FPT IS] Loading DMN process:', this.processCode);
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
          this.loadVariables();
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

  loadVariables() {
    this.isLoading = true;
    this.processService.getVariablesByCode(this.processCode).subscribe({
      next: (response: ApiResponse<ProcessVariableResponse[]>) => {
        this.variables = response.result;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('[FPT IS] Error loading variables:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  saveVariables() {
    console.log('[FPT IS] Saving variables:', this.variables);
    alert('Lưu tham số thành công!');
  }

  setActiveTab(tab: TabType) {
    this.activeTab = tab;
  }

  goBack() {
    this.router.navigate(['/dashboard/processes']);
  }
}
