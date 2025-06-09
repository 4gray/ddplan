import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as dvb from 'dvbjs';
import { AppStore } from '../../store';

@Component({
    selector: 'app-favorites',
    imports: [CommonModule, MatIconModule, MatIconButton],
    templateUrl: './favorites.html',
    styleUrls: ['./favorites.scss'],
})
export class FavoritesComponent {
    readonly stopSelected = output<dvb.IPoint>();

    private store = inject(AppStore);
    readonly favorites = this.store.favorites;

    selectStop(stop: dvb.IPoint): void {
        this.stopSelected.emit(stop);
    }

    removeFavorite(event: Event, stopName: string): void {
        event.stopPropagation(); // Prevent triggering selectStop
        this.store.removeFavorite(stopName);
    }
}
