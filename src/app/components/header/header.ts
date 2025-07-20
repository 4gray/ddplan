import { Component, input, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppMode } from '../../interfaces/app-mode.enum';
import { SearchFieldComponent } from '../search-field/search-field';

@Component({
    selector: 'app-header',
    templateUrl: './header.html',
    styleUrls: ['./header.scss'],
    imports: [MatToolbarModule, SearchFieldComponent],
})
export class HeaderComponent {
    readonly busStop = input<string>('');
    readonly currentMode = input<AppMode>(AppMode.ARRIVALS);

    readonly stopSelected = output<string>();

    readonly AppMode = AppMode;

    onStopSelected(stop: string): void {
        this.stopSelected.emit(stop);
    }
}
