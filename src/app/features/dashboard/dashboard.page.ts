import { Component, inject } from '@angular/core';
import { AuthStateService } from '../../state/auth-state.service';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard.page',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class DashboardPage {
  auth = inject(AuthStateService);
}
