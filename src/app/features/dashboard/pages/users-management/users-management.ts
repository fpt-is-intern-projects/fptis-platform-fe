import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersTableComponent } from './components/users-table/users-table';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { UserService } from '../../../../services/user.service';
import type { RemoteUser } from '../../../../models/user.model';

@Component({
  selector: 'app-users-management-page',
  standalone: true,
  imports: [CommonModule, UsersTableComponent, PaginationComponent],
  templateUrl: './users-management.html',
})
export class UsersManagement {
  private service = inject(UserService);

  data = signal<RemoteUser[]>([]);
  page = signal(0);
  size = 10;
  totalPages = signal(1);
  totalElements = signal(0);
  filter = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.service
      .getAllUsers({
        page: this.page(),
        size: this.size,
        filter: this.filter() || undefined,
      })
      .subscribe((res) => {
        const p = res.result;
        this.data.set(p.content);
        this.totalPages.set(p.totalPages);
        this.totalElements.set(p.totalElements);
      });
  }

  onSearch(value: string) {
    this.filter.set(value);
    this.page.set(0);
    this.load();
  }
}
