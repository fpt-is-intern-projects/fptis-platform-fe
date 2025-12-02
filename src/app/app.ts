import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { AuthStateService } from './state/auth-state.service';
import { UserService } from './services/user.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('fptis-platform-fe');

  private auth = inject(AuthStateService);
  private profile = inject(UserService);

  async ngOnInit() {
    const token = localStorage.getItem('access_token');

    if (!token) return;

    try {
      const res = await lastValueFrom(this.profile.getMe());

      if (res?.result) {
        this.auth.setUser(res.result);
      }
    } catch (e) {
      this.auth.clear();
    }
  }
}
