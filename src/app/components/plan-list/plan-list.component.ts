import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, input } from '@angular/core';

// Angular Material Modules
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArrivalInfo } from '../../interfaces/arrival-info.interface';

@Component({
    selector: 'app-plan-list',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButton,
        MatIconButton,
        MatIcon,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatListModule,
    ],
    templateUrl: './plan-list.component.html',
    styleUrls: ['./plan-list.component.scss'],
})
export class PlanListComponent {
    @Input() stop: string | null = null;
    planData = input<ArrivalInfo[]>([]);
    @Input() isLoading = false;
    @Input() lastUpdated: string | null = null;
    @Output() refreshPlanRequest = new EventEmitter<string>();
    @Output() morePlanRequest = new EventEmitter<string>();

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
        if (this.stop) {
            this.refreshPlanRequest.emit(this.stop);
        }
    }

    onMorePlan(): void {
        if (this.stop) {
            this.morePlanRequest.emit(this.stop);
        }
    }

    getDelayClass(delay: number | undefined): string {
        if (delay === undefined) return '';
        return delay > 0 ? 'delay-late' : delay < 0 ? 'delay-early' : '';
    }

    getDelayText(delay: number | undefined): string {
        if (delay === undefined) return '';
        return delay > 0 ? `+${delay}` : delay < 0 ? `${delay}` : '';
    }
}
