export type ItemStatus = 'pending' | 'on_sale' | 'reserved' | 'sold';
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
  createdBy?: string;
  creatorName?: string;
  location?: string;
  moderationNote?: string | null;
  approvedAt?: Date;
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
  updatedAt?: Date;
  status: 'new' | 'contacted' | 'closed';
  ownerId?: string;
  ownerName?: string;
  itemTitle?: string;
  lastMessageText?: string;
  lastMessageAt?: Date;
  participants?: string[];
  hiddenFor?: string[];
  unreadFor?: string[];
}

export interface InquiryMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  telegramUsername?: string;
  whatsappNumber?: string;
  inquiries: string[];
  createdAt: Date;
  language?: 'ru' | 'en' | 'tr';
  blockedFromPosting?: boolean;
  homeViewMode?: 'grid' | 'list';
  homeItemsPerPage?: 10 | 15 | 30;
}
