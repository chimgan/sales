export type ItemStatus = 'on_sale' | 'reserved' | 'sold';
export type Currency = 'TRY' | 'USD' | 'EUR' | 'RUB';

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  currency: Currency;
  images: string[];
  status: ItemStatus;
  category: string;
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Inquiry {
  id: string;
  itemId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  comment: string;
  createdAt: Date;
  status: 'new' | 'contacted' | 'closed';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  inquiries: string[];
  createdAt: Date;
  language?: 'ru' | 'en' | 'tr';
}
