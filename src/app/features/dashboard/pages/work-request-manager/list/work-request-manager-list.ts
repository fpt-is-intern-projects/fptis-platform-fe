import { Component, type OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { WorkRequestService } from '../../../../../services/work-request.service';
import { AlertService } from '../../../../../services/alert.service';
import type { MentorTaskResponse } from '../../../../../models/work-request.model';
import type {
  TaskCompleteRequest,
  ActionButtonResponse,
} from '../../../../../models/proccess.model';
import { getButtonClass } from '../../../../../utils/button-color.utils';

@Component({
  selector: 'app-work-request-manager-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-request-manager-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkRequestManagerList implements OnInit {
  pendingTasks: MentorTaskResponse[] = [];
  loading = false;

  reviewComments: { [key: string]: string } = {};

  getButtonClass = getButtonClass;

  constructor(
    private workRequestService: WorkRequestService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPendingTasks();
  }

  loadPendingTasks(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.workRequestService
      .getPendingTasks()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          this.pendingTasks = res.result ?? [];
        },
        error: (err) => {
          console.error('[FPT IS] Lỗi tải danh sách yêu cầu:', err);
          this.alertService.error('Không thể tải danh sách yêu cầu');
        },
      });
  }

  handleAction(taskId: string, button: ActionButtonResponse): void {
    const comment = this.reviewComments[taskId] || '';

    const request: TaskCompleteRequest = {
      taskId: taskId,
      variables: {
        [button.variableName]: button.value,
        comment: comment,
      },
    };

    this.workRequestService.completeTask(request).subscribe({
      next: (res) => {
        if (res.message) {
          this.alertService.error(res.message);
          return;
        }

        this.pendingTasks = this.pendingTasks.filter((t) => t.taskId !== taskId);
        delete this.reviewComments[taskId];
        this.alertService.success('Xử lý yêu cầu thành công');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[FPT IS] Lỗi xử lý yêu cầu:', err);
        this.alertService.error('Lỗi xử lý yêu cầu: ' + err.message);
      },
    });
  }
}
