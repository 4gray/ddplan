import { Injectable } from '@angular/core';
import { FavoriteStop } from '../interfaces/arrival-info.interface';

@Injectable({
    providedIn: 'root',
})
export class FavoritesService {
    private readonly FAVORITES_KEY = 'favoriteStops';

    constructor() {}

    getFavorites(): FavoriteStop[] {
        const favoritesString = localStorage.getItem(this.FAVORITES_KEY);
        if (!favoritesString) {
            return this.getDefaultFavorites();
        }

        try {
            return JSON.parse(favoritesString);
        } catch (e) {
            console.error('Error parsing favorites:', e);
            return this.getDefaultFavorites();
        }
    }

    saveFavorites(favorites: FavoriteStop[]): void {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }

    addFavorite(stop: FavoriteStop): void {
        const favorites = this.getFavorites();
        const existingIndex = favorites.findIndex((f) => f.name === stop.name);

        if (existingIndex >= 0) {
            favorites[existingIndex] = stop;
        } else {
            favorites.push(stop);
        }

        this.saveFavorites(favorites);
    }

    removeFavorite(stopName: string): void {
        const favorites = this.getFavorites();
        const filteredFavorites = favorites.filter((f) => f.name !== stopName);
        this.saveFavorites(filteredFavorites);
    }

    isFavorite(stopName: string): boolean {
        return this.getFavorites().some((f) => f.name === stopName);
    }

    private getDefaultFavorites(): FavoriteStop[] {
        return [
            {
                name: 'Straßburger Platz',
                lines: [
                    { id: 1, color: '#3367d6' },
                    { id: 2, color: '#3367d6' },
                    { id: 5, color: '#3367d6' },
                    { id: 'A', color: '#178642' },
                ],
            },
            {
                name: 'University Campus',
                lines: [
                    { id: 3, color: '#3367d6' },
                    { id: 7, color: '#3367d6' },
                    { id: 'B', color: '#178642' },
                ],
            },
            {
                name: 'Shopping Center',
                lines: [
                    { id: 2, color: '#3367d6' },
                    { id: 4, color: '#3367d6' },
                    { id: 'C', color: '#178642' },
                ],
            },
        ];
    }
}
