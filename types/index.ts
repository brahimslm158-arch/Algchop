export type ProductStatus = 'active' | 'sold' | 'paused';
export type UserType = 'buyer' | 'seller';

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  images: string[];
  options?: ProductOption[];
  phone: string;
  email?: string;
  location?: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerPhotoURL?: string;
  status: ProductStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
  userType: UserType;
  bio?: string;
  location?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  price: number;
  selectedOptions?: Record<string, string>;
  buyerName: string;
  buyerPhone: string;
  buyerAddress?: string;
  buyerEmail?: string;
  buyerId?: string;
  sellerId: string;
  sellerName?: string;
  sellerPhone?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  slug: string;
  label: string;
  icon?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
}
