import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FavoriteStop } from '../../interfaces/arrival-info.interface';
import { FavoritesService } from '../../services/favorites.service';

@Component({
    selector: 'app-favorites-list',
    imports: [
        CommonModule,
        MatCardModule,
        MatDividerModule,
        MatIconModule,
        MatListModule,
    ],
    template: `
        <div class="favorites-container">
            <h3 class="favorites-title">Favorite Stops</h3>

            <div class="favorites-list">
                @for (favorite of favorites; track favorite.name) {
                    <div
                        class="favorite-item"
                        (click)="selectStop(favorite.name)"
                    >
                        <div class="favorite-details">
                            <div class="favorite-name">{{ favorite.name }}</div>
                            <div class="line-chips">
                                @for (line of favorite.lines; track line.id) {
                                    <div
                                        class="line-chip"
                                        [style.backgroundColor]="
                                            line.color || '#757575'
                                        "
                                    >
                                        {{ line.id }}
                                    </div>
                                }
                            </div>
                        </div>
                        <mat-icon class="reorder-icon">reorder</mat-icon>
                    </div>
                    <mat-divider></mat-divider>
                }
            </div>
        </div>
    `,
    styles: [
        `
            .favorites-container {
                padding: 0 8px;
            }

            .favorites-title {
                font-size: 1rem;
                color: #616161;
                margin: 16px 8px;
            }

            .favorite-item {
                display: flex;
                padding: 12px 8px;
                align-items: center;
                cursor: pointer;
            }

            .favorite-details {
                flex-grow: 1;
            }

            .favorite-name {
                font-weight: 500;
                margin-bottom: 4px;
            }

            .line-chips {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
            }

            .line-chip {
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
                border-radius: 4px;
                color: white;
                font-size: 0.8rem;
                padding: 0 4px;
            }

            .reorder-icon {
                color: #bdbdbd;
            }

            /* Dark theme styles */
            :host-context(.dark-theme) .favorites-title {
                color: #bdbdbd;
            }

            :host-context(.dark-theme) .favorite-name {
                color: #ffffff;
            }

            :host-context(.dark-theme) .reorder-icon {
                color: #757575;
            }
        `,
    ],
})
export class FavoritesListComponent implements OnInit {
    favorites: FavoriteStop[] = [];
    @Output() stopSelected = new EventEmitter<string>();

    private favoritesService = inject(FavoritesService);

    ngOnInit(): void {
        this.loadFavorites();
    }

    loadFavorites(): void {
        this.favorites = this.favoritesService.getFavorites();
    }

    selectStop(stopName: string): void {
        this.stopSelected.emit(stopName);
    }
}
