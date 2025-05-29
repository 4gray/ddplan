import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanService } from './services/plan.service';

// Angular Material Modules
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { catchError, interval, of, Subscription } from 'rxjs';
import { FavoritesListComponent } from './components/favorites-list/favorites-list.component';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { SettingsComponent } from './components/settings/settings.component';
import {
    ArrivalInfo,
    RawArrivalData,
} from './interfaces/arrival-info.interface';

// Define the interface for the Electron API that will be exposed via preload script
interface ElectronAPI {
    sendQuit: () => void;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

enum AppMode {
    ARRIVALS,
    FAVORITES,
}

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        FormsModule,
        PlanListComponent,
        FavoritesListComponent,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatOptionModule,
        MatButtonModule,
        MatIcon,
        MatProgressBarModule,
        MatDialogModule,
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    isLoading = true;
    appMode = AppMode.ARRIVALS; // Default mode is ARRIVALS
    AppMode = AppMode; // Expose enum to template

    plan: ArrivalInfo[] = [];
    busStop = '';
    selectedStop = '';
    lastUpdated: string | null = null;
    stopsList: string[] = [];
    defaultStopKey = 'defaultStop';

    private autoRefreshSubscription?: Subscription;
    private autoRefresh = false;
    private refreshInterval = 30;

    private planService = inject(PlanService);
    /* private favoritesService = inject(FavoritesService);
    private themeService = inject(ThemeService); */
    private dialog = inject(MatDialog);

    ngOnInit(): void {
        console.log('AppComponent initializing...');

        this.stopsList = this.planService.getStops();
        this.loadDefaultStop();
        this.loadSettings();
    }

    ngOnDestroy(): void {
        if (this.autoRefreshSubscription) {
            this.autoRefreshSubscription.unsubscribe();
        }
    }

    private loadSettings(): void {
        const autoRefreshSetting = localStorage.getItem('autoRefresh');
        const intervalSetting = localStorage.getItem('refreshInterval');

        this.autoRefresh = autoRefreshSetting === 'true';
        this.refreshInterval = intervalSetting
            ? parseInt(intervalSetting, 10)
            : 30;

        if (this.autoRefresh) {
            this.startAutoRefresh();
        }
    }

    private startAutoRefresh(): void {
        if (this.autoRefreshSubscription) {
            this.autoRefreshSubscription.unsubscribe();
        }

        this.autoRefreshSubscription = interval(
            this.refreshInterval * 1000
        ).subscribe(() => {
            if (this.selectedStop && this.appMode === AppMode.ARRIVALS) {
                this.getPlan(this.selectedStop);
            }
        });
    }

    private stopAutoRefresh(): void {
        if (this.autoRefreshSubscription) {
            this.autoRefreshSubscription.unsubscribe();
            this.autoRefreshSubscription = undefined;
        }
    }

    loadDefaultStop(): void {
        const storedDefaultStop = localStorage.getItem(this.defaultStopKey);
        if (storedDefaultStop) {
            this.selectedStop = storedDefaultStop;
            this.busStop = storedDefaultStop;
            console.log(
                'Default stop loaded from localStorage:',
                this.selectedStop
            );
            this.getPlan(this.selectedStop);
        } else {
            console.log(
                'No default stop found in localStorage. Please set a default stop.'
            );
            this.isLoading = false; // No default stop to load, stop loading indicator
        }
    }

    setDefaultStop(stop: string): void {
        localStorage.setItem(this.defaultStopKey, stop);
        this.busStop = stop;
        this.selectedStop = stop;
        console.log('Default stop set:', stop);
    }

    getPlan(stop: string | null): void {
        if (!stop || stop.trim() === '') {
            console.log('getPlan called with empty stop.');
            this.isLoading = false;
            return;
        }
        console.log('Getting plan for:', stop);
        this.plan = [];
        this.isLoading = true;
        this.selectedStop = stop;

        this.planService
            .getPlan(stop)
            .pipe(
                catchError((error) => {
                    console.error('Error loading plan:', error);
                    this.plan = [];
                    this.isLoading = false;
                    return of(''); // Return an empty string on error
                })
            )
            .subscribe((response) => {
                this.plan = this.parseArrivalResponse(response);
                this.isLoading = false;
                this.lastUpdated = this.getCurrentTime();

                console.log('Plan data received for', stop);
            });
    }

    getCurrentTime(): string {
        const now = new Date();
        return `${this.pad(now.getHours())}:${this.pad(now.getMinutes())}:${this.pad(now.getSeconds())}`;
    }

    private pad(value: number): string {
        return value < 10 ? '0' + value : value.toString();
    }

    parseArrivalResponse(jsonString: string): ArrivalInfo[] {
        let rawData: unknown;

        try {
            rawData = JSON.parse(jsonString);
        } catch (err) {
            console.error('Invalid JSON:', err);
            return [];
        }

        if (!Array.isArray(rawData)) {
            console.error('Unexpected data format');
            return [];
        }

        return (rawData as RawArrivalData[])
            .filter((item) => Array.isArray(item) && item.length === 3)
            .map(([line, direction, arrivalTime]) => ({
                /* transportType: isNaN(Number(line)) ? 'Bus' : 'Tram',
                color: isNaN(Number(line)) ? '#178642' : '#3367d6', */
                line:
                    (isNaN(parseInt(line, 10)) ?? '-')
                        ? line
                        : parseInt(line, 10),
                direction,
                arrivalTime: parseInt(arrivalTime, 10),
            }));
    }

    querySearch(searchText: string): string[] {
        if (!searchText || searchText.trim() === '') {
            return [];
        }
        const lowerSearchText = searchText.toLowerCase();
        return this.stopsList.filter((stop) =>
            stop.toLowerCase().includes(lowerSearchText)
        );
    }

    onStopSelected(stop: string): void {
        console.log('Stop selected from autocomplete:', stop);
        this.setDefaultStop(stop);
        this.getPlan(stop);
    }

    closeApp(): void {
        console.log('Attempting to close app via Electron IPC...');
        if (window.electronAPI && window.electronAPI.sendQuit) {
            window.electronAPI.sendQuit();
        } else {
            console.warn(
                'Electron API for quit not available on window object. Ensure preload script is working.'
            );
            alert('Closing app (simulated - Electron IPC not found).');
        }
    }

    morePlan(hst: string): void {
        const currentLimit = 10;
        const newLimit = currentLimit + 10;

        console.log(
            `Requesting more plan data for ${hst} with limit ${newLimit}`
        );
        this.isLoading = true;
        this.planService
            .getPlan(hst, newLimit)
            .pipe(
                catchError((error) => {
                    console.error('Error loading more plan data:', error);
                    this.isLoading = false;
                    return of('');
                })
            )
            .subscribe((data) => {
                this.plan = this.plan.concat(this.parseArrivalResponse(data));
                this.isLoading = false;
                console.log('More plan data received for', hst);
            });
    }

    showFavorites(): void {
        this.appMode = AppMode.FAVORITES;
    }

    showArrivals(): void {
        this.appMode = AppMode.ARRIVALS;
    }

    onFavoriteSelected(stopName: string): void {
        this.selectedStop = stopName;
        this.busStop = stopName;
        this.getPlan(stopName);
    }

    openSettings(): void {
        const dialogRef = this.dialog.open(SettingsComponent, {
            height: '350px',
            /* width: '100%',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'fullscreen-dialog', */
        });

        dialogRef.componentInstance.settingsChanged.subscribe(
            (settings: any) => {
                this.autoRefresh = settings.autoRefresh;
                this.refreshInterval = settings.refreshInterval;

                if (this.autoRefresh) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            }
        );
    }
}
