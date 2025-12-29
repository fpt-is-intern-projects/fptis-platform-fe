import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent {
  alertService = inject(AlertService);

  getAlertClass(type: string): string {
    const baseClasses = 'flex items-start gap-3 p-4 rounded-lg shadow-lg border';

    switch (type) {
      case 'error':
        return `${baseClasses} bg-red-50 border-red-500 text-red-800`;
      case 'success':
        return `${baseClasses} bg-green-50 border-green-500 text-green-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-500 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-500 text-gray-800`;
    }
  }

  getIconPath(type: string): string {
    switch (type) {
      case 'error':
        return 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z';
      case 'success':
        return 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z';
      case 'warning':
        return 'M10 18a8 8 0 100-16 8 8 0 000 16zM9.25 9a.75.75 0 011.5 0v2.5a.75.75 0 01-1.5 0V9zm1 5.25a.75.75 0 100-1.5.75.75 0 000 1.5z';
      case 'info':
        return 'M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zm0 6a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5z';
      default:
        return '';
    }
  }

  close(id: string) {
    this.alertService.remove(id);
  }
}
