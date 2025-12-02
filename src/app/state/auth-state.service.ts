import { computed, Injectable, signal } from '@angular/core';
import type { RemoteUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  currentUser = signal<RemoteUser | null>(null);

  isLoggedIn = computed(() => this.currentUser() !== null);

  setUser(user: RemoteUser) {
    this.currentUser.set(user);
  }

  clear() {
    this.currentUser.set(null);
  }
}
