import { Component, type OnInit, type OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../../services/attendance.service';
import type { AttendanceResponse } from '../../../../models/attendance.model';
import type { ApiResponse, PageResponse } from '../../../../models/api-response.model';

@Component({
  selector: 'app-attendance',
  imports: [CommonModule],
  templateUrl: './attendance.html',
  standalone: true,
})
export class Attendance implements OnInit, OnDestroy {
  Math = Math;
  currentTime = '';
  currentDate = '';
  currentAttendance: AttendanceResponse | null = null;
  attendanceHistory: AttendanceResponse[] = [];
  isLoading = false;
  private timeInterval: any;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(private attendanceService: AttendanceService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateTime();
    this.timeInterval = setInterval(() => this.updateTime(), 1000);
    this.loadCurrentAttendance();
    this.loadAttendanceHistory();
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    this.currentDate = now.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    this.cdr.detectChanges();
  }

  loadCurrentAttendance() {
    this.attendanceService.getCurrentAttendance().subscribe({
      next: (response: ApiResponse<AttendanceResponse>) => {
        this.currentAttendance = response.result;
        this.cdr.detectChanges();
      },
      error: () => {
        this.currentAttendance = null;
        this.cdr.detectChanges();
      },
    });
  }

  loadAttendanceHistory() {
    this.attendanceService
      .getAttendanceHistory({ page: this.currentPage, size: this.pageSize })
      .subscribe({
        next: (response: ApiResponse<PageResponse<AttendanceResponse>>) => {
          this.attendanceHistory = response.result.content;
          this.totalPages = response.result.totalPages;
          this.totalElements = response.result.totalElements;
          this.currentPage = response.result.page;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log('[FPT IS] Error loading history:', error);
        },
      });
  }

  handleCheckIn() {
    this.isLoading = true;
    this.attendanceService.checkIn().subscribe({
      next: () => {
        this.loadCurrentAttendance();
        this.loadAttendanceHistory();
        this.isLoading = false;
      },
      error: (error) => {
        console.log('[FPT IS] Check-in error:', error);
        this.isLoading = false;
      },
    });
  }

  handleCheckOut() {
    this.isLoading = true;
    this.attendanceService.checkOut().subscribe({
      next: () => {
        this.loadCurrentAttendance();
        this.loadAttendanceHistory();
        this.isLoading = false;
      },
      error: (error) => {
        console.log('[FPT IS] Check-out error:', error);
        this.isLoading = false;
      },
    });
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadAttendanceHistory();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadAttendanceHistory();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAttendanceHistory();
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    const [year, month, day] = dateString.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatTime(timeString: string | null): string {
    if (!timeString) return '—';
    // Remove milliseconds if present (e.g., "17:46:07.156" -> "17:46:07")
    const timeParts = timeString.split('.');
    return timeParts[0];
  }

  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-600';

    switch (status) {
      case 'CHECKED_IN_ON_TIME':
      case 'CHECKED_OUT_ON_TIME':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'CHECKED_IN_LATE':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'CHECKED_OUT_EARLY':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  formatStatus(status: string): string {
    if (!status) return 'Chưa có';

    switch (status) {
      case 'CHECKED_IN_ON_TIME':
        return 'Vào đúng giờ';
      case 'CHECKED_IN_LATE':
        return 'Vào trễ';
      case 'CHECKED_OUT_ON_TIME':
        return 'Ra đúng giờ';
      case 'CHECKED_OUT_EARLY':
        return 'Ra sớm';
      default:
        return status;
    }
  }

  downloadReport() {
    this.isLoading = true;
    this.attendanceService.downloadAttendanceReport().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `BaoCao_ChamCong_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: (error) => {
        console.log('[FPT IS] Download report error:', error);
        this.isLoading = false;
      },
    });
  }
}
