import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DailyLogResponse, UpdateDailyLogRequest } from '../../../../../../models/daily-log.model';

@Component({
  selector: 'daily-log-update-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './daily-log-update-form.html',
})
export class DailyLogUpdateForm {
  @Input() initial: DailyLogResponse | null = null;
  @Output() submitForm = new EventEmitter<UpdateDailyLogRequest>();

  // FormControl rất đơn giản, không bị nested form bug
  mainTask = new FormControl('');
  result = new FormControl('');

  ngOnChanges() {
    if (this.initial) {
      this.mainTask.setValue(this.initial.mainTask);
      this.result.setValue(this.initial.result);
    }
  }

  onSave() {
    this.submitForm.emit({
      mainTask: this.mainTask.value ?? '',
      result: this.result.value ?? '',
    });
  }
}
