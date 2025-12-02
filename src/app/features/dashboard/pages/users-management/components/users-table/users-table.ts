import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { RemoteUser } from '../../../../../../models/user.model';

@Component({
  selector: 'users-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-table.html',
})
export class UsersTableComponent {
  @Input() data: RemoteUser[] = [];
}
