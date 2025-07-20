import { computed, effect } from '@angular/core';
import {
    patchState,
    signalStore,
    withComputed,
    withHooks,
    withMethods,
    withState,
} from '@ngrx/signals';
import * as dvb from 'dvbjs';

interface AppSettings {
    isDarkMode: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
    defaultStop: string | null;
}

interface AppState {
    selectedStop: dvb.IPoint | null;
    favorites: dvb.IPoint[];
    settings: AppSettings;
    isFirstStart: boolean;
    resultCount: number;
}

const loadPersistedSettings = (): AppSettings => {
    const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    const autoRefresh = localStorage.getItem('autoRefresh') === 'true';
    const refreshInterval = parseInt(
        localStorage.getItem('refreshInterval') || '30',
        10
    );
    const defaultStop = localStorage.getItem('defaultStop');

    return {
        isDarkMode,
        autoRefresh,
        refreshInterval,
        defaultStop,
    };
};

const loadPersistedFavorites = (): dvb.IPoint[] => {
    try {
        const stored = localStorage.getItem('favorites');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Failed to parse favorites from localStorage:', error);
        return [];
    }
};

const loadPersistedSelectedStop = (): dvb.IPoint | null => {
    try {
        const stored = localStorage.getItem('defaultStop');
        if (!stored) return null;

        // If it's valid JSON, parse it
        const parsed = JSON.parse(stored);
        return parsed;
    } catch (error) {
        // If it's not valid JSON (legacy format), remove it from localStorage
        console.warn(
            'Invalid defaultStop format detected, removing from localStorage:',
            error
        );
        localStorage.removeItem('defaultStop');
        return null;
    }
};

const initialState: AppState = {
    selectedStop: loadPersistedSelectedStop(),
    favorites: loadPersistedFavorites(),
    settings: loadPersistedSettings(),
    isFirstStart: localStorage.getItem('isFirstStart') !== 'false',
    resultCount: 9,
};

export const AppStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ selectedStop, settings }) => ({
        hasSelectedStop: computed(() => selectedStop() !== null),
        isDarkMode: computed(() => settings().isDarkMode),
        autoRefresh: computed(() => settings().autoRefresh),
        refreshInterval: computed(() => settings().refreshInterval),
    })),
    withMethods((store) => ({
        // Stop management
        setSelectedStop: (stop: dvb.IPoint | null) => {
            patchState(store, { selectedStop: stop });
            if (stop) {
                try {
                    const serializedStop = JSON.stringify(stop);
                    localStorage.setItem('defaultStop', serializedStop);
                    patchState(store, {
                        settings: {
                            ...store.settings(),
                            defaultStop: serializedStop,
                        },
                        resultCount: 9, // Reset result count on new stop selection
                    });
                } catch (error) {
                    console.error('Failed to serialize selected stop:', error);
                }
            }
        },

        // Settings management
        updateSettings: (newSettings: Partial<AppSettings>) => {
            const updatedSettings = { ...store.settings(), ...newSettings };
            patchState(store, { settings: updatedSettings });

            // Persist to localStorage
            localStorage.setItem(
                'isDarkMode',
                updatedSettings.isDarkMode.toString()
            );
            localStorage.setItem(
                'autoRefresh',
                updatedSettings.autoRefresh.toString()
            );
            localStorage.setItem(
                'refreshInterval',
                updatedSettings.refreshInterval.toString()
            );

            if (updatedSettings.defaultStop) {
                localStorage.setItem(
                    'defaultStop',
                    updatedSettings.defaultStop
                );
            }
        },

        toggleDarkMode: () => {
            const currentSettings = store.settings();
            const newSettings = {
                ...currentSettings,
                isDarkMode: !currentSettings.isDarkMode,
            };
            patchState(store, { settings: newSettings });
            localStorage.setItem(
                'isDarkMode',
                newSettings.isDarkMode.toString()
            );

            // Update body class for theme
            const body = document.body;
            if (newSettings.isDarkMode) {
                body.classList.add('dark-theme');
            } else {
                body.classList.remove('dark-theme');
            }
        },

        setAutoRefresh: (enabled: boolean) => {
            const currentSettings = store.settings();
            const newSettings = { ...currentSettings, autoRefresh: enabled };
            patchState(store, { settings: newSettings });
            localStorage.setItem('autoRefresh', enabled.toString());
        },

        setRefreshInterval: (interval: number) => {
            const currentSettings = store.settings();
            const newSettings = {
                ...currentSettings,
                refreshInterval: interval,
            };
            patchState(store, { settings: newSettings });
            localStorage.setItem('refreshInterval', interval.toString());
        },

        // Favorites management
        addFavorite: (stop: dvb.IPoint) => {
            const currentFavorites = store.favorites();
            const exists = currentFavorites.some(
                (fav) => fav.name === stop.name
            );

            if (!exists) {
                const newFavorites = [...currentFavorites, stop];
                patchState(store, { favorites: newFavorites });
                localStorage.setItem('favorites', JSON.stringify(newFavorites));
            }
        },

        removeFavorite: (stopName: string) => {
            const newFavorites = store
                .favorites()
                .filter((fav) => fav.name !== stopName);
            patchState(store, { favorites: newFavorites });
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
        },

        setFirstStartCompleted: () => {
            patchState(store, { isFirstStart: false });
            localStorage.setItem('isFirstStart', 'false');
        },

        setResultCount: (count: number) => {
            patchState(store, { resultCount: count });
        },
    })),
    withHooks({
        onInit: (store) => {
            effect(() => {
                const isDarkMode = store.settings().isDarkMode;
                const body = document.body;
                if (isDarkMode) {
                    body.classList.add('dark-theme');
                } else {
                    body.classList.remove('dark-theme');
                }
            });
        },
    })
);
