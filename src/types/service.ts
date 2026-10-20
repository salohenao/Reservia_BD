export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
  providerId: string;
  providerName: string;
  providerLocation?: string;
  imageUrl?: string;
  rating: number;
  reviewsCount: number;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface ServiceForm {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
}
