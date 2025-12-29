import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export type Alert = {
  id: string;
  type: AlertType;
  message: string;
};

@Injectable({ providedIn: 'root' })
export class AlertService {
  alerts = signal<Alert[]>([]);
  private idCounter = 0;

  show(message: string, type: AlertType = 'error', duration = 5000) {
    const id = `alert-${++this.idCounter}`;
    const alert: Alert = { id, type, message };

    this.alerts.update((alerts) => [...alerts, alert]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  error(message: string, duration = 5000) {
    this.show(message, 'error', duration);
  }

  success(message: string, duration = 5000) {
    this.show(message, 'success', duration);
  }

  warning(message: string, duration = 5000) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 5000) {
    this.show(message, 'info', duration);
  }

  remove(id: string) {
    this.alerts.update((alerts) => alerts.filter((a) => a.id !== id));
  }

  clear() {
    this.alerts.set([]);
  }
}
