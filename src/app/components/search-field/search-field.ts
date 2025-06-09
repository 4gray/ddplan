import { Component, inject, resource, signal } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconButton } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import * as dvb from 'dvbjs';
import { AppStore } from '../../store';

@Component({
    selector: 'app-search-field',
    imports: [
        MatAutocompleteModule,
        MatFormFieldModule,
        MatIcon,
        MatIconButton,
        MatInputModule,
        MatOptionModule,
    ],
    templateUrl: './search-field.html',
    styleUrls: ['./search-field.scss'],
})
export class SearchFieldComponent {
    private readonly store = inject(AppStore);
    readonly searchString = signal('');

    selectedStop: dvb.IPoint | null = null;
    stopsList: string[] = [];

    constructor() {
        // Initialize search string with current selected stop
        const currentStop = this.store.selectedStop();
        if (currentStop) {
            this.searchString.set(currentStop.name);
        }
    }

    searchResults = resource({
        params: () => ({ searchString: this.searchString() }),
        loader: ({ params }) => {
            if (!params.searchString || params.searchString.length < 3) {
                return Promise.resolve([]); // Return empty array if search string is too short
            }
            return dvb.findStop(params.searchString).then((stops) => {
                if (!stops || stops.length === 0) {
                    return [];
                }
                return stops.filter((s) => s.city === 'Dresden');
            });
        },
    });

    displayFn(stop: dvb.IPoint): string {
        return stop && stop.name ? stop.name : '';
    }

    onStopSelected(stop: dvb.IPoint): void {
        if (this.selectedStop?.id && this.selectedStop.id === stop.id) return;
        this.searchString.set(stop.name);
        this.store.setSelectedStop(stop);
    }

    onSearchInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchString.set(target.value);
    }

    onClear(): void {
        this.searchString.set('');
        this.selectedStop = null;
        this.store.setSelectedStop(null);
    }
}
