import { Component, inject, signal, computed, type OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../../../../state/auth-state.service';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  requiredRole?: string;
}

@Component({
  selector: 'dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private auth = inject(AuthStateService);

  collapsed = signal(false);

  toggle() {
    this.collapsed.update((v) => !v);
  }

  allMenuItems: MenuItem[] = [
    { icon: 'home', label: 'Trang Chính', href: 'main' },
    { icon: 'clock', label: 'Chấm Công', href: 'attendance' },
    { icon: 'document', label: 'Nhật Ký', href: 'work-log' },
    { icon: 'briefcase', label: 'Yêu Cầu Làm Việc', href: 'work-request' },
    {
      icon: 'users',
      label: 'Quản lý người dùng',
      href: 'users-management',
      requiredRole: 'USERS_VIEW',
    },
  ];

  menuItems = computed(() => {
    const user = this.auth.currentUser();
    const userRoles = user?.roles || [];

    return this.allMenuItems.filter((item) => {
      if (!item.requiredRole) return true;
      const hasRole = userRoles.includes(item.requiredRole);
      return hasRole;
    });
  });
}
