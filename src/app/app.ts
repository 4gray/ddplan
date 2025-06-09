import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';

// Angular Material Modules
import * as dvb from 'dvbjs';
import { interval, Subscription } from 'rxjs';
import { FavoritesComponent } from './components/favorites/favorites';
import { HeaderComponent } from './components/header/header';
import { PlanListComponent } from './components/plan-list/plan-list';
import { SettingsComponent } from './components/settings/settings';
import { SidebarComponent } from './components/sidebar/sidebar';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen';
import { AppMode } from './interfaces/app-mode.enum';
import { AppStore } from './store';

// Define the interface for the Electron API that will be exposed via preload script
interface ElectronAPI {
    sendQuit: () => void;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        FavoritesComponent,
        HeaderComponent,
        PlanListComponent,
        SettingsComponent,
        SidebarComponent,
        WelcomeScreenComponent,
    ],
    templateUrl: './app.html',
    styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    appMode = AppMode.ARRIVALS;
    readonly AppMode = AppMode;

    readonly selectedStopName = signal<string>('');

    private autoRefreshSubscription?: Subscription;
    private store = inject(AppStore);

    get isFirstStart() {
        return this.store.isFirstStart();
    }

    get autoRefresh() {
        return this.store.autoRefresh();
    }

    get refreshInterval() {
        return this.store.refreshInterval();
    }

    ngOnInit(): void {
        console.log('AppComponent initializing...');
        //this.loadDefaultStop();

        // Start auto refresh if enabled
        if (this.autoRefresh) {
            this.startAutoRefresh();
        }
    }

    ngOnDestroy(): void {
        if (this.autoRefreshSubscription) {
            this.autoRefreshSubscription.unsubscribe();
        }
    }

    private startAutoRefresh(): void {
        if (this.autoRefreshSubscription) {
            this.autoRefreshSubscription.unsubscribe();
        }

        this.autoRefreshSubscription = interval(
            this.refreshInterval * 1000
        ).subscribe(() => {
            if (this.selectedStopName() && this.appMode === AppMode.ARRIVALS) {
                this.handleRefreshPlan(this.selectedStopName());
            }
        });
    }

    private stopAutoRefresh(): void {
        if (this.autoRefreshSubscription) {
            this.autoRefreshSubscription.unsubscribe();
            this.autoRefreshSubscription = undefined;
        }
    }

    handleRefreshPlan(stop: string): void {
        this.selectedStopName.set(stop);
    }

    closeApp(): void {
        if (window.electronAPI) {
            window.electronAPI.sendQuit();
        }
    }

    onModeChanged(mode: AppMode): void {
        this.appMode = mode;
    }

    showFavorites(): void {
        this.appMode = AppMode.FAVORITES;
    }

    showArrivals(): void {
        this.appMode = AppMode.ARRIVALS;
    }

    onFavoriteSelected(stop: dvb.IPoint): void {
        // Set the selected stop in the store (this also sets it as default)
        this.store.setSelectedStop(stop);

        this.appMode = AppMode.ARRIVALS;

        this.selectedStopName.set(stop.name);
    }

    onWelcomeDismissed(): void {
        this.store.setFirstStartCompleted();
    }
}
