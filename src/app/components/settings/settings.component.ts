import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatSlideToggleModule,
        MatDividerModule,
    ],
    template: `
        <div class="settings-header">
            <mat-toolbar color="primary">
                <button mat-icon-button (click)="close()">
                    <mat-icon>close</mat-icon>
                </button>
                <span>Settings</span>
            </mat-toolbar>
        </div>

        <div class="settings-content">
            <mat-list>
                <mat-list-item>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-title">Dark Mode</div>
                            <div class="setting-description">
                                Switch between light and dark themes
                            </div>
                        </div>
                        <mat-slide-toggle
                            [checked]="isDarkMode"
                            (change)="onDarkModeToggle($event.checked)"
                            color="primary"
                        >
                        </mat-slide-toggle>
                    </div>
                </mat-list-item>

                <mat-divider></mat-divider>

                <mat-list-item>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-title">Auto Refresh</div>
                            <div class="setting-description">
                                Automatically refresh arrival times
                            </div>
                        </div>
                        <mat-slide-toggle
                            [checked]="autoRefresh"
                            (change)="onAutoRefreshToggle($event.checked)"
                            color="primary"
                        >
                        </mat-slide-toggle>
                    </div>
                </mat-list-item>

                <mat-divider></mat-divider>

                <mat-list-item>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-title">Refresh Interval</div>
                            <div class="setting-description">
                                How often to refresh ({{ refreshInterval }}s)
                            </div>
                        </div>
                        <div class="interval-controls">
                            <button
                                mat-icon-button
                                (click)="decreaseInterval()"
                                [disabled]="refreshInterval <= 15"
                            >
                                <mat-icon>remove</mat-icon>
                            </button>
                            <span class="interval-value"
                                >{{ refreshInterval }}s</span
                            >
                            <button
                                mat-icon-button
                                (click)="increaseInterval()"
                                [disabled]="refreshInterval >= 120"
                            >
                                <mat-icon>add</mat-icon>
                            </button>
                        </div>
                    </div>
                </mat-list-item>
            </mat-list>

            <div class="settings-footer">
                <div class="app-info">
                    <h3>DDPlan</h3>
                    <p>Version 1.0.0</p>
                    <p>Dresden Departure Monitor</p>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .settings-header {
                position: sticky;
                top: 0;
                z-index: 10;
            }

            .settings-content {
                padding: 0;
                height: calc(100vh - 64px);
                overflow-y: auto;
            }

            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                padding: 8px 0;
            }

            .setting-info {
                flex: 1;
            }

            .setting-title {
                font-weight: 500;
                margin-bottom: 4px;
            }

            .setting-description {
                font-size: 0.875rem;
                color: #757575;
            }

            .interval-controls {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .interval-value {
                min-width: 40px;
                text-align: center;
                font-weight: 500;
            }

            .settings-footer {
                padding: 24px 16px;
                text-align: center;
                margin-top: auto;
            }

            .app-info h3 {
                margin: 0 0 8px 0;
                color: #1976d2;
            }

            .app-info p {
                margin: 4px 0;
                color: #757575;
                font-size: 0.875rem;
            }

            :host-context(.dark-theme) .setting-description {
                color: #bdbdbd;
            }

            :host-context(.dark-theme) .app-info p {
                color: #bdbdbd;
            }
        `,
    ],
})
export class SettingsComponent implements OnInit {
    isDarkMode = false;
    autoRefresh = false;
    refreshInterval = 30;

    @Output() settingsChanged = new EventEmitter<any>();

    constructor(
        private themeService: ThemeService,
        private dialogRef: MatDialogRef<SettingsComponent>
    ) {}

    ngOnInit(): void {
        this.isDarkMode = this.themeService.getCurrentTheme();
        this.loadSettings();
    }

    private loadSettings(): void {
        const autoRefreshSetting = localStorage.getItem('autoRefresh');
        const intervalSetting = localStorage.getItem('refreshInterval');

        this.autoRefresh = autoRefreshSetting === 'true';
        this.refreshInterval = intervalSetting
            ? parseInt(intervalSetting, 10)
            : 30;
    }

    onDarkModeToggle(enabled: boolean): void {
        this.isDarkMode = enabled;
        this.themeService.setDarkMode(enabled);
        this.emitSettingsChanged();
    }

    onAutoRefreshToggle(enabled: boolean): void {
        this.autoRefresh = enabled;
        localStorage.setItem('autoRefresh', enabled.toString());
        this.emitSettingsChanged();
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
        localStorage.setItem(
            'refreshInterval',
            this.refreshInterval.toString()
        );
        this.emitSettingsChanged();
    }

    private emitSettingsChanged(): void {
        this.settingsChanged.emit({
            isDarkMode: this.isDarkMode,
            autoRefresh: this.autoRefresh,
            refreshInterval: this.refreshInterval,
        });
    }

    close(): void {
        this.dialogRef.close();
    }
}
