import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DailyLogTableComponent } from './components/daily-log-table/daily-log-table';
import { DailyLogDialog } from './components/daily-log-dialog/daily-log-dialog';
import { DailyLogCreateForm } from './components/daily-log-create-form/daily-log-create-form';
import { DailyLogUpdateForm } from './components/daily-log-update-form/daily-log-update-form';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { DailyLogService } from '../../../../services/daily-log.service';
import { DailyLogResponse } from '../../../../models/daily-log.model';

@Component({
  selector: 'app-daily-log-page',
  standalone: true,
  imports: [
    CommonModule,
    DailyLogTableComponent,
    DailyLogDialog,
    DailyLogCreateForm,
    DailyLogUpdateForm,
    PaginationComponent,
  ],
  templateUrl: './daily-log.html',
})
export class DailyLog {
  private service = inject(DailyLogService);

  data = signal<DailyLogResponse[]>([]);
  page = signal(0);
  size = 10;
  totalPages = signal(1);
  totalElements = signal(0);

  showCreate = signal(false);
  showUpdate = signal(false);
  selected = signal<DailyLogResponse | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.service
      .getCurrentUserDailyLogs({
        page: this.page(),
        size: this.size,
      })
      .subscribe((res) => {
        const p = res.result;
        this.data.set(p.content);
        this.totalPages.set(p.totalPages);
        this.totalElements.set(p.totalElements);
      });
  }

  openCreate() {
    this.showCreate.set(true);
  }

  create(body: any) {
    this.service.createDailyLog(body).subscribe(() => {
      this.showCreate.set(false);
      this.load();
    });
  }

  openUpdate(item: DailyLogResponse) {
    this.selected.set(item);
    this.showUpdate.set(true);
  }

  update(body: any) {
    this.service.updateDailyLog(this.selected()!.id, body).subscribe(() => {
      this.showUpdate.set(false);
      this.load();
    });
  }

  delete(id: number) {
    this.service.deleteDailyLog(id).subscribe(() => this.load());
  }
}
