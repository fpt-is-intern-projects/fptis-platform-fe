import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../../state/auth-state.service';
import { UserMenu } from '../user-menu/user-menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, UserMenu],
  templateUrl: './header.html',
})
export class Header {
  auth = inject(AuthStateService);
}
