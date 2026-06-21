import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MockDatabaseService } from './core/servicos/mock-database.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly mockDatabase = inject(MockDatabaseService);
  constructor() { this.mockDatabase.inicializar(); }
}
