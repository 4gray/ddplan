import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
    ArrivalInfo,
    RawArrivalData,
} from '../interfaces/arrival-info.interface';
import { STOPS_LIST } from './stops-list';

@Injectable({
    providedIn: 'root',
})
export class PlanService {
    constructor(private http: HttpClient) {}

    /**
     * Fetches the list of stop names from the local stops.json file.
     * @returns An Observable emitting an array of stop names.
     */
    getStops(): string[] {
        return STOPS_LIST;
    }

    /**
     * Fetches the departure plan for a given stop.
     * @param hst The stop name (Hauptsammeltext).
     * @param limit The maximum number of departures to fetch (default is 10).
     * @returns An Observable emitting the raw response text (likely HTML/XML) from the VVO API.
     */
    getPlan(hst: string, limit = 10): Observable<string> {
        const url = `http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do?ort=Dresden&hst=${encodeURIComponent(
            hst
        )}&vz=1&lim=${limit}`;
        return this.http
            .get(url, { responseType: 'text' }) // VVO API returns non-JSON
            .pipe(catchError(this.handleError));
    }

    parseArrivalResponse(jsonString: string): ArrivalInfo[] {
        let rawData: unknown;

        try {
            rawData = JSON.parse(jsonString);
        } catch (err) {
            console.error('Invalid JSON:', err);
            return [];
        }

        if (!Array.isArray(rawData)) {
            console.error('Unexpected data format');
            return [];
        }

        return (rawData as RawArrivalData[])
            .filter((item) => Array.isArray(item) && item.length === 3)
            .map(([line, direction, arrivalTime]) => {
                // Determine transport type based on line format
                const transportType = isNaN(Number(line)) ? 'Bus' : 'Tram';
                const color = transportType === 'Tram' ? '#3367d6' : '#178642';

                return {
                    line,
                    direction,
                    arrivalTime: parseInt(arrivalTime, 10),
                    transportType,
                    color,
                };
            });
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, ` +
                    `body was: ${error.message}`
            );
        }
        // Return an observable with a user-facing error message.
        return throwError(
            () => new Error('Something bad happened; please try again later.')
        );
    }
}
