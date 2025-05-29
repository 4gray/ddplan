import {
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
    ],
};
