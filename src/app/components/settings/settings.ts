import { Component, inject, OnInit } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppStore } from '../../store';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [MatIconButton, MatIcon, MatSlideToggleModule],
    templateUrl: './settings.html',
    styleUrl: './settings.scss',
})
export class SettingsComponent implements OnInit {
    isDarkMode = false;
    autoRefresh = false;
    refreshInterval = 30;

    private store = inject(AppStore);

    ngOnInit(): void {
        const settings = this.store.settings();
        this.isDarkMode = settings.isDarkMode;
        this.autoRefresh = settings.autoRefresh;
        this.refreshInterval = settings.refreshInterval;
    }

    onDarkModeToggle(enabled: boolean): void {
        this.isDarkMode = enabled;
        this.store.toggleDarkMode();
    }

    onAutoRefreshToggle(enabled: boolean): void {
        this.autoRefresh = enabled;
        this.store.setAutoRefresh(enabled);
    }

    increaseInterval(): void {
        if (this.refreshInterval < 120) {
            this.refreshInterval += 15;
            this.saveInterval();
        }
    }

    decreaseInterval(): void {
        if (this.refreshInterval > 15) {
            this.refreshInterval -= 15;
            this.saveInterval();
        }
    }

    private saveInterval(): void {
        this.store.setRefreshInterval(this.refreshInterval);
    }
}
