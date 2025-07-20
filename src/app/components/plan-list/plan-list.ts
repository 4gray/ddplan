import { DatePipe } from '@angular/common';
import {
    Component,
    computed,
    inject,
    input,
    resource,
    signal,
} from '@angular/core';

import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import * as dvb from 'dvbjs';
import { AppStore } from '../../store';

@Component({
    selector: 'app-plan-list',
    imports: [DatePipe, MatButton, MatIconButton, MatIcon],
    templateUrl: './plan-list.html',
    styleUrls: ['./plan-list.scss'],
})
export class PlanListComponent {
    readonly stop = input<string | null>(null);

    private store = inject(AppStore);

    readonly lastUpdated = signal<Date>(new Date());
    readonly selectedStop = this.store.selectedStop;
    readonly favorites = this.store.favorites;
    readonly resultCount = this.store.resultCount;

    // Computed property to check if current stop is favorite
    readonly isCurrentStopFavorite = computed(() => {
        const currentStop = this.selectedStop();
        if (!currentStop) return false;

        return this.favorites().some((fav) => fav.name === currentStop.name);
    });

    planResource = resource({
        params: () => ({
            selectedStop: this.selectedStop(),
            lastUpdated: this.lastUpdated(),
            resultCount: this.resultCount(),
        }),
        loader: ({ params }) => {
            if (!params.selectedStop) {
                return Promise.resolve([]);
            }
            const timeOffset = 3;
            return dvb.monitor(
                params.selectedStop.id,
                timeOffset,
                params.resultCount
            );
        },
    });

    getCurrentTime(): string {
        const now = new Date();
        return `${this.pad(now.getHours())}:${this.pad(now.getMinutes())}`;
    }

    addMinutes(minutes: number): string {
        const curr = new Date();
        const date = new Date(curr.getTime() + minutes * 60000);
        return `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`;
    }

    private pad(value: number): string {
        return value < 10 ? '0' + value : value.toString();
    }

    onRefresh(): void {
        this.lastUpdated.set(new Date());
    }

    onMorePlan(): void {
        this.store.setResultCount(this.resultCount() + 10);
    }

    getDelayClass(delay: number | undefined): string {
        if (delay === undefined) return '';
        return delay > 0 ? 'delay-late' : delay < 0 ? 'delay-early' : '';
    }

    getDelayText(delay: number | undefined): string {
        if (delay === undefined) return '';
        return delay > 0 ? `+${delay}` : delay < 0 ? `${delay}` : '';
    }

    toggleFavorite(): void {
        const currentStop = this.selectedStop();
        if (!currentStop) return;

        if (this.isCurrentStopFavorite()) {
            this.store.removeFavorite(currentStop.name);
        } else {
            this.store.addFavorite(currentStop);
        }
    }
}
