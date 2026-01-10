
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  hours: string;
  status: 'open' | 'closed';
  rating: number;
  reviewsCount: number;
  distance: string;
  minOrder: number;
  logoUrl: string;
  bannerUrl: string;
}

export interface CustomerData {
  name: string;
  whatsapp: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
}

export interface ShippingState {
  fee: number | null;
  loading: boolean;
  calculated: boolean;
}
