import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { AppMode } from '../../interfaces/app-mode.enum';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.html',
    styleUrls: ['./sidebar.scss'],
    imports: [MatIconButton, MatIcon, MatTooltip],
})
export class SidebarComponent {
    readonly currentMode = input<AppMode>(AppMode.ARRIVALS);

    readonly modeChanged = output<AppMode>();
    readonly exitClicked = output<void>();

    readonly AppMode = AppMode;

    onArrivalsClick(): void {
        this.modeChanged.emit(AppMode.ARRIVALS);
    }

    onFavoritesClick(): void {
        this.modeChanged.emit(AppMode.FAVORITES);
    }

    onSettingsClick(): void {
        this.modeChanged.emit(AppMode.SETTINGS);
    }

    onExitClick(): void {
        this.exitClicked.emit();
    }
}
