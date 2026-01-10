
import { Product, Category, StoreInfo } from './types';

export const STORE: StoreInfo = {
  name: "Roxo Sabor",
  tagline: "Açaí Premium & Cremoso",
  hours: "Todos os dias, 11h às 23h",
  status: 'open',
  rating: 4.9,
  reviewsCount: 157,
  distance: "2.4 km",
  minOrder: 15.00,
  logoUrl: "https://images.unsplash.com/photo-1623114112815-9988bc7f3730?q=80&w=100&auto=format&fit=crop", 
  bannerUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1200&auto=format&fit=crop"
};

export const CATEGORIES: Category[] = [
  { id: 'promos', name: '🔥 Promoções' },
  { id: 'cup', name: '🥤 No Copo' },
  { id: 'combos', name: '🍱 Combos' },
  { id: 'extras', name: '🍬 Adicionais' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Açaí Tradicional 500ml',
    description: 'Copo de 500ml com até 4 acompanhamentos grátis à sua escolha.',
    price: 26.90,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=800&auto=format&fit=crop',
    category: 'cup',
    isPopular: true
  },
  {
    id: '2',
    name: 'Barca Roxo Sabor (G)',
    description: 'Aproximadamente 1kg de açaí, frutas frescas, leite condensado e guloseimas.',
    price: 54.90,
    image: 'https://images.unsplash.com/photo-1623114112815-9988bc7f3730?q=80&w=800&auto=format&fit=crop',
    category: 'combos',
    isPopular: true
  }
];
