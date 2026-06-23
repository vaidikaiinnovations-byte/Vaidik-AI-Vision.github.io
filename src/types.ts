export type ItemCategory = 'plant' | 'animal' | 'thing' | 'all';

export interface ScanResult {
  id: string;
  name: string;
  scientificName: string;
  category: 'plant' | 'animal' | 'thing';
  confidence: number;
  description: string;
  keyFeatures: string[];
  careTips: string[];
  facts: string[];
  origin: string;
  dangerWarning: string;
  imageUrl: string; // Base64 or uploaded image URL
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  profilePicture: string; // Base64 encoded string or abstract avatar initial
  favoriteCategory: ItemCategory;
  joinedAt: string;
  scanCount: number;
  milestoneTitle: string; // e.g., "Seedling", "Junior Park Ranger", "Expert Identifier"
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface HistoryItem {
  id: string;
  scanResult: ScanResult;
  timestamp: string;
}
