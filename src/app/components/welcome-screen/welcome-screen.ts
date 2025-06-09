import { Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-welcome-screen',
    standalone: true,
    imports: [MatCardModule, MatButtonModule, MatIconModule],
    templateUrl: './welcome-screen.html',
    styleUrls: ['./welcome-screen.scss'],
})
export class WelcomeScreenComponent {
    readonly dismissed = output<void>();

    onDismiss(): void {
        this.dismissed.emit();
    }
}
