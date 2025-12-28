import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../../../../state/auth-state.service';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  requiredRole?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  requiredRole?: string;
}

@Component({
  selector: 'dashboard-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private auth = inject(AuthStateService);

  collapsed = signal(false);

  toggle() {
    this.collapsed.update((v) => !v);
  }

  allMenuSections: MenuSection[] = [
    {
      title: 'CHUNG',
      items: [
        { icon: 'home', label: 'Trang Chủ', href: 'main' },
        { icon: 'clock', label: 'Chấm Công', href: 'attendance' },
        { icon: 'document', label: 'Nhật Ký', href: 'work-log' },
        { icon: 'briefcase', label: 'Yêu Cầu Làm Việc', href: 'work-request' },
      ],
    },
    {
      title: 'NGƯỜI DÙNG',
      items: [
        { icon: 'id-card', label: 'Hồ sơ cá nhân', href: 'user-profile' },
        { icon: 'chart-bar', label: 'Tiến Độ Thực Tập', href: 'internship-progress' },
      ],
    },
    {
      title: 'QUẢN LÝ',
      requiredRole: 'ROLE_MENTOR',
      items: [
        { icon: 'users', label: 'Quản Lý Người Dùng', href: 'users-management' },
        { icon: 'shield-check', label: 'Phân Quyền', href: 'role-management' },
        { icon: 'clipboard-check', label: 'Duyệt Yêu Cầu Làm Việc', href: 'work-request-manager' },
        { icon: 'cog', label: 'Quản Lý Quy Trình', href: 'processes' },
      ],
    },
  ];

  menuSections = computed(() => {
    const user = this.auth.currentUser();
    const userRoles = user?.roles || [];

    return this.allMenuSections
      .filter((section) => {
        if (!section.requiredRole) return true;
        return userRoles.includes(section.requiredRole);
      })
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!item.requiredRole) return true;
          return userRoles.includes(item.requiredRole);
        }),
      }))
      .filter((section) => section.items.length > 0);
  });
}
