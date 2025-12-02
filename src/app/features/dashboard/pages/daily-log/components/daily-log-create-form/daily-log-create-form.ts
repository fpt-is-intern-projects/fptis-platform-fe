import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CreateDailyLogRequest } from '../../../../../../models/daily-log.model';

@Component({
  selector: 'daily-log-create-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './daily-log-create-form.html',
})
export class DailyLogCreateForm {
  @Output() submitForm = new EventEmitter<CreateDailyLogRequest>();

  // dùng FormControl cho đơn giản
  mainTask = new FormControl('');
  result = new FormControl('');
  workDate = new FormControl('');
  startTime = new FormControl('');
  endTime = new FormControl('');
  location = new FormControl('');

  onSave() {
    this.submitForm.emit({
      mainTask: this.mainTask.value ?? '',
      result: this.result.value ?? '',
      workDate: this.workDate.value ?? '',
      startTime: this.startTime.value ?? '',
      endTime: this.endTime.value ?? '',
      location: this.location.value ?? '',
    });
  }
}
