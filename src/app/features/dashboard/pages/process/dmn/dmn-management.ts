import {
  Component,
  type OnInit,
  type OnDestroy,
  ChangeDetectorRef,
  inject,
  ViewChild,
  type ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import DmnModeler from 'dmn-js/lib/Modeler';

import { ProcessManagementService } from '../../../../../services/process-management.service';
import type {
  ProcessDefinitionResponse,
  ProcessDeployRequest,
  ProcessVariableResponse,
} from '../../../../../models/proccess.model';
import type { ApiResponse } from '../../../../../models/api-response.model';

type TabType = 'variables' | 'diagram' | 'settings';

@Component({
  selector: 'app-dmn-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dmn-management.html',
  styleUrls: ['./dmn-management.scss'],
})
export class DmnManagement implements OnInit, OnDestroy {
  private processService = inject(ProcessManagementService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('dmnContainer', { static: false }) private dmnContainer!: ElementRef;

  private dmnModeler: any;
  activeTab: TabType = 'variables';
  processName = '';
  processCode = '';
  isProcessActive = true;
  variables: ProcessVariableResponse[] = [];
  isLoading = false;
  isDiagramLoaded = false;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.processCode = params['code'];
      this.loadProcessDefinition();
    });
  }

  ngOnDestroy() {
    if (this.dmnModeler) {
      this.dmnModeler.destroy();
    }
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
      error: () => {
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
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadDmnDiagram(): void {
    this.isLoading = true;

    this.processService.getProcessXml(this.processCode).subscribe({
      next: async (res: ApiResponse<string>) => {
        if (!this.dmnModeler) {
          this.dmnModeler = new DmnModeler({
            container: this.dmnContainer.nativeElement,
          });
        }

        try {
          await this.dmnModeler.importXML(res.result);
          const views = this.dmnModeler.getViews();
          const tableView = views.find((v: any) => v.type === 'decisionTable');
          if (tableView) {
            await this.dmnModeler.open(tableView);
          }

          this.isDiagramLoaded = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        } catch (err) {
          this.isLoading = false;
          console.error('[FPT IS] Error loading DMN:', err);
        }
      },
    });
  }

  async saveDiagram() {
    try {
      this.isLoading = true;
      const { xml } = await this.dmnModeler.saveXML({ format: true });
      const file = new File([xml], `${this.processCode}.dmn`, { type: 'application/xml' });

      const request: ProcessDeployRequest = {
        name: this.processName,
        processCode: this.processCode,
        resourceType: 'DMN',
      };

      this.processService.deployProcess(request, file).subscribe({
        next: () => {
          alert('Lưu sơ đồ quy trình thành công!');
          this.loadVariables();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          alert('Lỗi hệ thống khi lưu');
          this.isLoading = false;
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  setActiveTab(tab: TabType) {
    this.activeTab = tab;
    if (tab === 'diagram') {
      setTimeout(() => this.loadDmnDiagram(), 50);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/processes']);
  }
}
