import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'daily-log-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-log-dialog.html',
})
export class DailyLogDialog {
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
}
