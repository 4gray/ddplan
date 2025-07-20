import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly THEME_KEY = 'isDarkMode';
    private isDarkModeSubject = new BehaviorSubject<boolean>(false);

    isDarkMode$ = this.isDarkModeSubject.asObservable();

    constructor() {
        this.loadTheme();
    }

    private loadTheme(): void {
        const savedTheme = localStorage.getItem(this.THEME_KEY);
        const isDarkMode = savedTheme === 'true';
        this.setDarkMode(isDarkMode);
    }

    setDarkMode(isDarkMode: boolean): void {
        this.isDarkModeSubject.next(isDarkMode);
        localStorage.setItem(this.THEME_KEY, isDarkMode.toString());
        this.updateBodyClass(isDarkMode);
    }

    toggleDarkMode(): void {
        const currentValue = this.isDarkModeSubject.value;
        this.setDarkMode(!currentValue);
    }

    private updateBodyClass(isDarkMode: boolean): void {
        const body = document.body;
        if (isDarkMode) {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
    }

    getCurrentTheme(): boolean {
        return this.isDarkModeSubject.value;
    }
}
