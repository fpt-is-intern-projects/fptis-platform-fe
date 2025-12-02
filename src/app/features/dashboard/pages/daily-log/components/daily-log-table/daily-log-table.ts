import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DailyLogResponse } from '../../../../../../models/daily-log.model';

@Component({
  selector: 'daily-log-table',
  standalone: true,
  templateUrl: './daily-log-table.html',
})
export class DailyLogTableComponent {
  @Input() data: DailyLogResponse[] = [];

  @Output() edit = new EventEmitter<DailyLogResponse>();
  @Output() delete = new EventEmitter<number>();
}
