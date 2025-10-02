
export interface ProductImages {
    yellow: string;
    rose: string;
    white: string;
}


export interface Product {
    name: string;
    popularityScore: number;
    weight: number;
    images: ProductImages;
    price: number;
    priceFormatted: string;
    rating: number;
    goldPriceUsed: number;
}


export interface ApiResponse {
    success: boolean;
    count: number;
    goldPrice: number;
    timestamp: string;
    products: Product[];
}

export type GoldColor = 'yellow' | 'rose' | 'white';


export interface GoldColorInfo {
    key: GoldColor;
    name: string;
    hex: string;
}