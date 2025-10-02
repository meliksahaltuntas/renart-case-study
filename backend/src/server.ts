
// Type Definitions
interface Product {
    name: string;
    popularityScore: number;
    weight: number;
    images: {
        yellow: string;
        rose: string;
        white: string;
    };
}

interface ProductWithPrice extends Product {

    price: number;
    priceFormatted: string;
    rating: number;
    goldPriceUsed: number;
}

interface GoldPriceResponse {
    success: boolean;
    timestamp: number;
    base: string;
    rates: {
        XAU: number;         // XAU = Gold
    };
}

// Imports
import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();


const app = express();

//PORT
const PORT: number = parseInt(process.env.PORT || '5000', 10);
console.log(`Sunucu ${PORT} portunda baslatilacak`);

//CORS
app.use(cors());
console.log('CORS - Tüm originlerden istek kabul edilir');

//JSON
app.use(express.json());
console.log('JSON parser etkinlestirildi');


app.use(express.urlencoded({ extended: true }));
console.log('✅ URL-encoded parser etkinleştirildi');

const productsPath: string = path.join(__dirname, '..', 'products.json');
console.log(`Ürün dosyasi yolu: ${productsPath}`);

let productsJsonText: string;
try {
    productsJsonText = fs.readFileSync(productsPath, 'utf-8');
    console.log('products.json dosyasi başariyla okundu');

} catch (error) {

    console.error('ERROR: products.json dosyasi okunamadi!');
    console.error('Detail:', error);

    process.exit(1);

}

let productsData: Product[];

try {
    productsData = JSON.parse(productsJsonText);
    console.log(`${productsData.length} ürün parse edildi`);

    console.log('📦 İlk ürün:', productsData[0].name);

} catch (error) {
    console.error('ERROR: JSON parse edilemedi! Dosya formati hatali olabilir.');
    console.error('Detail:', error);
    process.exit(1);
}




// Gerçek zamanlı altın fiyatını GoldAPI.io'dan çeker
async function getGoldPrice(): Promise<number> {
    try {
        console.log('GoldAPI.io\'dan altın fiyatı alınıyor...');

        if (!process.env.GOLD_API_KEY) {
            console.warn('GOLD_API_KEY bulunamadı, varsayılan değer kullanılıyor');
            return 85;
        }


        const response = await axios.get('https://www.goldapi.io/api/XAU/USD', {
            headers: {
                'x-access-token': process.env.GOLD_API_KEY
            },
            timeout: 5000
        });


        const goldPricePerGram: number = response.data.price_gram_24k;


        if (goldPricePerGram < 50 || goldPricePerGram > 150) {
            console.warn(`⚠️  Anormal altın fiyatı: $${goldPricePerGram}/gram`);
            console.warn('🔄 Varsayılan değer kullanılıyor');
            return 85;
        }

        console.log(`✅ Güncel altın fiyatı: $${goldPricePerGram.toFixed(2)}/gram`);
        console.log(`   (24k saf altın, kaynak: GoldAPI.io)`);

        return goldPricePerGram;

    } catch (error) {

        if (axios.isAxiosError(error)) {
            if (error.response) {
                // API cevap verdi ama hata döndü
                console.error(`GoldAPI.io Hatası: ${error.response.status}`);
                console.error(`Mesaj: ${error.response.data?.error || 'Bilinmeyen hata'}`);

                if (error.response.status === 401) {
                    console.error('API key geçersiz! .env dosyasını kontrol edin');
                } else if (error.response.status === 429) {
                    console.error('API limiti doldu! (100 istek/gün)');
                }
            } else if (error.request) {
                // İstek gitti ama cevap gelmedi
                console.error('GoldAPI.io\'ya erişilemiyor (network hatası)');
            } else {
                // İstek bile atılamadı
                console.error('İstek oluşturulamadı:', error.message);
            }
        } else {
            console.error('Beklenmeyen hata:', error);
        }

        console.warn('Varsayılan altın fiyatı kullanılıyor: $85/gram');
        return 85;
    }
}

function calculatePrice(
    popularityScore: number,
    weight: number,
    goldPrice: number
): string {
    const price: number = (popularityScore + 1) * weight * goldPrice;
    console.log(`Hesaplanan fiyat: $${price.toFixed(2)}`);

    return price.toFixed(2);
}

function convertPopularityTo5(popularityScore: number): string {

    const score: number = popularityScore * 5;
    return score.toFixed(1);
}


//API

app.get('/', (req: Request, res: Response) => {

    res.json({
        success: true,
        message: 'API çalisiyor!',
        version: '1.0.0',
        endpoints: {

            products: {
                url: '/api/products',
                method: 'GET',
                description: 'Tüm ürünleri fiyatlariyla birlikte getirir'
            },
            filteredProducts: {
                url: '/api/products/filter',
                method: 'GET',
                description: 'Ürünleri fiyat ve rating\'e göre filtreler',
                exampleUsage: '/api/products/filter?minPrice=100&maxPrice=500'
            },
            goldPrice: {
                url: '/api/gold-price',
                method: 'GET',
                description: 'Güncel altın fiyatını getirir'
            }
        },
        timestamp: new Date().toISOString()
        /**
         * new Date() → Şu anki tarih-saat
         * toISOString() → ISO 8601 formatına çevir
         * Örnek: "2024-10-03T10:30:00.000Z"
         */
    });

    console.log('Ana sayfa isteği karsilandi');

});

console.log('Endpoint tanimlandi: GET /');


app.get('/api/products', async (req: Request, res: Response) => {

    console.log('Yeni istek: GET /api/products');
    console.log(`İstek zamanı: ${new Date().toLocaleString('tr-TR')}`);
    try {
        const goldPrice: number = await getGoldPrice();
        console.log(`Altın fiyatı alındı: $${goldPrice.toFixed(2)}/gram`);
        console.log('Ürün fiyatları hesaplanıyor...');

        const productsWithPrices: ProductWithPrice[] = productsData.map((product: Product) => {

            const price: string = calculatePrice(
                product.popularityScore,
                product.weight,
                goldPrice
            );

            const ratingOutOf5: string = convertPopularityTo5(product.popularityScore);

            const priceFormatted: string = `$${price} USD`;

            return {
                ...product,

                price: parseFloat(price),
                priceFormatted: priceFormatted,
                rating: parseFloat(ratingOutOf5),
                goldPriceUsed: goldPrice
            };
        });


        console.log(`✅ ${productsWithPrices.length} ürün başarıyla hazırlandı`);
        console.log(`   Fiyat aralığı: $${Math.min(...productsWithPrices.map(p => p.price)).toFixed(2)} - $${Math.max(...productsWithPrices.map(p => p.price)).toFixed(2)}`);


        res.json({

            success: true,
            count: productsWithPrices.length,
            goldPrice: goldPrice,
            timestamp: new Date().toISOString(),
            products: productsWithPrices
        });

        console.log('📤 Cevap gönderildi');

    } catch (error) {

        console.error('HATA: Ürünler getirilirken bir sorun oluştu');
        console.error('Hata detayı:', error);

        res.status(500).json({

            success: false,
            message: 'Ürünler yüklenirken bir hata oluştu',
            error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
    }
});

console.log('Endpoint tanımlandı: GET /api/products');



app.get('/api/products/filter', async (req: Request, res: Response) => {


    console.log('📥 Yeni istek: GET /api/products/filter');
    console.log('   Gelen parametreler:', req.query);


    try {
        const { minPrice, maxPrice, minRating, maxRating } = req.query;

        console.log('Filtreler:');
        if (minPrice) console.log(`   Min Fiyat: $${minPrice}`);
        if (maxPrice) console.log(`   Max Fiyat: $${maxPrice}`);
        if (minRating) console.log(`   Min Rating: ${minRating}/5`);
        if (maxRating) console.log(`   Max Rating: ${maxRating}/5`);

        const goldPrice: number = await getGoldPrice();

        let productsWithPrices: ProductWithPrice[] = productsData.map((product: Product) => {
            const price: string = calculatePrice(
                product.popularityScore,
                product.weight,
                goldPrice
            );

            const ratingOutOf5: string = convertPopularityTo5(product.popularityScore);

            return {
                ...product,
                price: parseFloat(price),
                priceFormatted: `$${price} USD`,
                rating: parseFloat(ratingOutOf5),
                goldPriceUsed: goldPrice
            };
        });

        console.log(`Toplam ${productsWithPrices.length} ürün hazırlandı`);

        if (minPrice) {

            const minPriceNum: number = parseFloat(minPrice as string);
            productsWithPrices = productsWithPrices.filter(
                (product: ProductWithPrice) => product.price >= minPriceNum
            );
            console.log(`Min fiyat filtresi uygulandı: ${productsWithPrices.length} ürün kaldı`);
        }
        if (maxPrice) {
            const maxPriceNum: number = parseFloat(maxPrice as string);

            productsWithPrices = productsWithPrices.filter(
                (product: ProductWithPrice) => product.price <= maxPriceNum
            );

            console.log(`Max fiyat filtresi uygulandı: ${productsWithPrices.length} ürün kaldı`);
        }

        if (minRating) {
            const minRatingNum: number = parseFloat(minRating as string);

            productsWithPrices = productsWithPrices.filter(
                (product: ProductWithPrice) => product.rating >= minRatingNum
            );

            console.log(`Min rating filtresi uygulandı: ${productsWithPrices.length} ürün kaldı`);
        }
        if (maxRating) {
            const maxRatingNum: number = parseFloat(maxRating as string);

            productsWithPrices = productsWithPrices.filter(
                (product: ProductWithPrice) => product.rating <= maxRatingNum
            );

            console.log(`Max rating filtresi uygulandı: ${productsWithPrices.length} ürün kaldı`);
        }
        console.log(`Toplam ${productsWithPrices.length} ürün filtreleme sonrası kaldı`);

        res.json({
            success: true,
            count: productsWithPrices.length,

            filters: {
                minPrice: minPrice ? parseFloat(minPrice as string) : null,
                maxPrice: maxPrice ? parseFloat(maxPrice as string) : null,
                minRating: minRating ? parseFloat(minRating as string) : null,
                maxRating: maxRating ? parseFloat(maxRating as string) : null

            },

            goldPrice: goldPrice,
            timestamp: new Date().toISOString(),
            products: productsWithPrices
        });

        console.log('📤 Filtrelenmiş ürünler gönderildi');

    } catch (error) {

        console.error('HATA: Filtreleme sırasında bir sorun oluştu');
        console.error('Hata detayı:', error);

        res.status(500).json({
            success: false,
            message: 'Ürünler filtrelenirken bir hata oluştu',
            error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
    }
});

console.log('Endpoint tanımlandı: GET /api/products/filter');

app.get('/api/gold-price', async (req: Request, res: Response) => {
    console.log('📥 Yeni istek: GET /api/gold-price');

    try {

        const goldPrice: number = await getGoldPrice();

        res.json({
            success: true,
            goldPrice: goldPrice,
            goldPriceFormatted: `$${goldPrice.toFixed(2)}/gram`,


            unit: 'USD/gram',

            timestamp: new Date().toISOString(),

            source: 'metals-api.com'

        });

        console.log(`Altın fiyatı gönderildi: $${goldPrice.toFixed(2)}/gram`);

    } catch (error) {

        console.error('HATA: Altın fiyatı alınamadı');
        console.error('Hata detayı:', error);

        res.status(500).json({
            success: false,
            message: 'Altın fiyatı alınamadı',
            error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
    }
});

console.log('Endpoint tanımlandı: GET /api/gold-price');


//ERROR HANDLER
app.use((req: Request, res: Response) => {

    console.log(`404: Bilinmeyen endpoint: ${req.method} ${req.path}`);

    res.status(404).json({

        success: false,
        message: `Endpoint bulunamadı: ${req.method} ${req.path}`,

        availableEndpoints: [

            {
                method: 'GET',
                path: '/',
                description: 'API bilgileri'
            },
            {
                method: 'GET',
                path: '/api/products',
                description: 'Tüm ürünleri getir'
            },
            {
                method: 'GET',
                path: '/api/products/filter',
                description: 'Filtrelenmiş ürünleri getir'
            },
            {
                method: 'GET',
                path: '/api/gold-price',
                description: 'Güncel altın fiyatı'
            }
        ]
    });
});

console.log('404 handler tanımlandı');

//Server Listening
app.listen(PORT, () => {


    console.log(`
  ╔════════════════════════════════════════════════════════╗
  ║                                                        ║
  ║   SUNUCU BAŞARIYLA BAŞLATILDI!                     ║
  ║                                                        ║
  ║   Port:        ${PORT}                              ║
  ║   Local URL:   http://localhost:${PORT}             ║
  ║   Başlatma:    ${new Date().toLocaleString('tr-TR')} ║
  ║                                                        ║
  ║   Mevcut Endpoint'ler:                              ║
  ║   ├─ GET  /                                           ║
  ║   ├─ GET  /api/products                               ║
  ║   ├─ GET  /api/products/filter                        ║
  ║   └─ GET  /api/gold-price                             ║
  ║                                                        ║
  ║   Sunucuyu durdurmak için: CTRL + C               ║
  ║                                                        ║
  ╚════════════════════════════════════════════════════════╝
  `);

    console.log('\nİlk altın fiyatı kontrolü yapılıyor...\n');

    getGoldPrice().then((price) => {

        console.log(`Başlangıç altın fiyatı: $${price.toFixed(2)}/gram\n`);
        console.log('API kullanıma hazır!\n');

    }).catch((error) => {

        console.warn('Altın fiyatı alınamadı, varsayılan değer kullanılacak\n');
    });
});


process.on('SIGINT', () => {


    console.log('\n\nSunucu kapatılıyor...');


    process.exit(0);

});


process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {

    console.error('İşlenmeyen Promise reddi yakalandı:');
    console.error('Sebep:', reason);
    console.error('Promise:', promise);
});

process.on('uncaughtException', (error: Error) => {


    console.error('İşlenmeyen hata yakalandı:');
    console.error(error);

    console.log('Sunucu güvenlik nedeniyle kapatılıyor...');
    process.exit(1);

});

console.log('Hata yakalayıcılar kuruldu');


//EXPORT Test Icin
export default app;


console.log('server.ts dosyası tamamen yüklendi');