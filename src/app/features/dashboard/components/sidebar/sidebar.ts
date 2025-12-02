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
export class Sidebar implements OnInit {
  private auth = inject(AuthStateService);

  collapsed = signal(false);

  ngOnInit() {
    console.log('Sidebar initialized');
    console.log('Auth service:', this.auth);
    console.log('Current user on init:', this.auth.currentUser());
  }

  toggle() {
    this.collapsed.update((v) => !v);
  }

  allMenuItems: MenuItem[] = [
    { icon: 'chart', label: 'Analytics', href: 'analytics' },
    { icon: 'clock', label: 'Chấm công', href: 'attendance' },
    { icon: 'document', label: 'Nhật ký', href: 'work-log' },
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

    console.log('Current user in sidebar:', user);
    console.log('User roles:', userRoles);
    console.log('Has USERS_VIEW role:', userRoles.includes('USERS_VIEW'));

    return this.allMenuItems.filter((item) => {
      if (!item.requiredRole) return true;
      const hasRole = userRoles.includes(item.requiredRole);
      console.log(`Menu item "${item.label}" requires "${item.requiredRole}":`, hasRole);
      return hasRole;
    });
  });
}
