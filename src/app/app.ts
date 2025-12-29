import { Component, inject, type OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { AlertComponent } from './shared/components/alert/alert.component';
import { AuthStateService } from './state/auth-state.service';
import { AuthService } from './services/auth.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, AlertComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('fptis-platform-fe');

  private auth = inject(AuthStateService);
  private profile = inject(AuthService);

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
