export type RawArrivalData = [string, string, string];

export interface ArrivalInfo {
    line: string | number;
    direction: string;
    arrivalTime: number;
    transportType?: 'Tram' | 'Bus' | string;
    delay?: number;
    color?: string;
}

export interface FavoriteStop {
    name: string;
    lines: Array<{ id: string | number; color?: string }>;
}
