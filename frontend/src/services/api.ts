import axios from 'axios';
import type { ApiResponse } from '../types';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://renart-case-study-o108.onrender.com';

// Axios instance oluştur
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});


export const fetchProducts = async (): Promise<ApiResponse> => {
    try {
        const response = await apiClient.get<ApiResponse>('/api/products');
        return response.data;
    } catch (error) {
        console.error('Ürünler alınamadı:', error);
        throw error;
    }
};


export const fetchFilteredProducts = async (
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    maxRating?: number
): Promise<ApiResponse> => {
    try {
        const response = await apiClient.get<ApiResponse>('/api/products/filter', {
            params: {
                minPrice,
                maxPrice,
                minRating,
                maxRating,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Filtrelenmiş ürünler alınamadı:', error);
        throw error;
    }
};

export const fetchGoldPrice = async () => {
    try {
        const response = await apiClient.get('/api/gold-price');
        return response.data;
    } catch (error) {
        console.error('Altın fiyatı alınamadı:', error);
        throw error;
    }
};