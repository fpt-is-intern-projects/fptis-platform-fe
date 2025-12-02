import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgClass],
  templateUrl: './pagination.html',
})
export class PaginationComponent {
  @Input() currentPage = 0; // 0-based
  @Input() totalPages = 1;
  @Input() totalElements = 0;
  @Input() size = 10;

  @Output() currentPageChange = new EventEmitter<number>();

  min(a: number, b: number) {
    return Math.min(a, b);
  }

  /** Tính danh sách trang */
  get pages(): (number | string)[] {
    const cp = this.currentPage;
    const tp = this.totalPages;

    if (tp <= 1) return [0];

    const center: (number | string)[] = [cp - 2, cp - 1, cp, cp + 1, cp + 2].filter(
      (n) => n > 0 && n < tp - 1
    );

    if (cp === 4) center.unshift(1);
    if (cp === tp - 5) center.push(tp - 2);

    if (cp > 4) center.unshift('...');
    if (cp < tp - 5) center.push('...');

    return [0, ...center, tp - 1];
  }

  /** Hiển thị +1 nhưng không đổi logic */
  displayPage(p: number | string): number | string {
    return typeof p === 'number' ? p + 1 : p;
  }

  /** Đổi trang */
  changePage(page: number | string) {
    if (typeof page === 'string') return; // skip ...
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.currentPageChange.emit(page);
  }
}
