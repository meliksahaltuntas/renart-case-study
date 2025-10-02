import { useEffect, useState } from 'react';
import { fetchProducts } from './services/api';
import type { Product } from './types';
import ProductCarousel from './components/ProductCarousel';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goldPrice, setGoldPrice] = useState<number>(0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data.products);
        setGoldPrice(data.goldPrice);
      } catch (err) {
        setError('Ürünler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Product List
          </h1>
          <p className="text-gray-600">
            Current Gold Price: ${goldPrice.toFixed(2)}/gram
          </p>
        </div>

        {/* Carousel */}
        <ProductCarousel products={products} />
      </div>
    </div>
  );
}