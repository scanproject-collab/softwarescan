export interface PolygonPoint {
    lat: number;
    lng: number;
}

export interface Polygon {
    id: string;
    name: string;
    points: PolygonPoint[];
    author?: {
        id: string;
        name?: string;
        institution?: {
            id: string;
            title?: string;
        };
    };
    notes?: string;
}

export interface Post {
    id: string;
    title?: string;
    content?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    tags: any[];
    location?: string;
    author: {
        id: string;
        name?: string;
        email?: string;
        institution?: {
            id: string;
            title?: string;
        };
    };
    weight?: number | string;
    ranking?: string;
    imageUrl?: string;
}

export interface PolygonRankingInfo {
    totalWeight: number;
    ranking: string;
    count: number;
} 