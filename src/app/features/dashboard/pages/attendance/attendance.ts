import { Component, type OnInit, type OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../../services/attendance.service';
import type {
  AttendanceResponse,
  StatusCountReportObject,
} from '../../../../models/attendance.model';
import type { ApiResponse, PageResponse } from '../../../../models/api-response.model';

import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexDataLabels,
} from 'ng-apexcharts';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './attendance.html',
})
export class Attendance implements OnInit, OnDestroy {
  Math = Math;

  // Biến hiển thị thời gian
  currentTime = '00:00:00';
  currentDate = '';

  currentAttendance: AttendanceResponse | null = null;
  attendanceHistory: AttendanceResponse[] = [];
  isLoading = false;
  private timeInterval: any;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Thống kê
  statusStats: StatusCountReportObject[] = [];
  pieSeries: ApexNonAxisChartSeries = [];
  pieLabels: string[] = [];

  pieChart: ApexChart = { type: 'pie', width: 320 };
  piePlotOptions: ApexPlotOptions = {
    pie: {
      dataLabels: {
        offset: -15,
        minAngleToShowLabel: 10,
      },
      expandOnClick: true,
    },
  };
  pieDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => val.toFixed(1) + '%',
    style: { fontSize: '14px', fontWeight: 'bold', colors: ['#fff'] },
  };
  pieResponsive: ApexResponsive[] = [
    {
      breakpoint: 768,
      options: { chart: { width: 260 }, legend: { position: 'bottom' } },
    },
  ];

  constructor(
    private attendanceService: AttendanceService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Inject NgZone để xử lý đồng hồ
  ) {}

  ngOnInit() {
    this.startClock(); // Khởi động đồng hồ
    this.loadCurrentAttendance();
    this.loadAttendanceHistory();
    this.loadAttendanceStatistic();
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  // Sử dụng NgZone để đồng hồ chạy mượt mà và cập nhật đúng UI
  startClock() {
    this.ngZone.runOutsideAngular(() => {
      this.timeInterval = setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        const dateString = now.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Quay lại zone của Angular để cập nhật biến và trigger Change Detection
        this.ngZone.run(() => {
          this.currentTime = timeString;
          this.currentDate = dateString;
          this.cdr.detectChanges();
        });
      }, 1000);
    });
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
        error: (error) => console.log('[FPT IS] Error loading history:', error),
      });
  }

  handleCheckIn() {
    this.isLoading = true;
    this.attendanceService.checkIn().subscribe({
      next: () => {
        this.loadCurrentAttendance();
        this.loadAttendanceHistory();
        this.loadAttendanceStatistic();
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  handleCheckOut() {
    this.isLoading = true;
    this.attendanceService.checkOut().subscribe({
      next: () => {
        this.loadCurrentAttendance();
        this.loadAttendanceHistory();
        this.loadAttendanceStatistic();
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  // --- Helper Methods ---

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

    for (let i = startPage; i <= endPage; i++) pages.push(i);
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
    return timeString.split('.')[0];
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

  loadAttendanceStatistic() {
    this.attendanceService.getCurrentUserAttendanceStatistic().subscribe({
      next: (res: ApiResponse<StatusCountReportObject[]>) => {
        this.statusStats = res.result;
        const total = this.statusStats.reduce((acc, curr) => acc + curr.count, 0);
        if (total > 0) {
          this.pieSeries = this.statusStats.map((i) => (i.count / total) * 100);
          this.pieLabels = this.statusStats.map((i) => this.formatStatus(i.status));
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.log('[FPT IS] statistic error', err),
    });
  }
}
