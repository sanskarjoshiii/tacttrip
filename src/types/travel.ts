export interface TravelInput {
  budget: number;
  source: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  preference: 'cheapest' | 'fastest' | 'balanced';
}

export interface TransportOption {
  id: string;
  type: 'flight' | 'train' | 'bus';
  name: string;
  cost: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  comfort: 'Basic' | 'Standard' | 'Premium';
  isRecommended?: boolean;
  reason?: string;
}

export interface HotelOption {
  id: string;
  name: string;
  pricePerNight: number;
  rating: number;
  distance: string;
  amenities: string[];
  image: string;
  isBestValue?: boolean;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  type: 'attraction' | 'food' | 'shopping';
  category?: string;
  image: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  description: string;
  image: string;
  distance: string;
}

export interface WeatherInfo {
  condition: string;
  temperature: number;
  icon: string;
  advice: string;
}

export interface BudgetBreakdown {
  transport: number;
  hotel: number;
  dailyExpense: number;
  totalDays: number;
  totalEstimated: number;
  remaining: number;
  utilizationPercent: number;
  isWithinBudget: boolean;
}

export interface TravelPlan {
  input: TravelInput;
  transport: TransportOption[];
  hotels: HotelOption[];
  attractions: Attraction[];
  food: Attraction[];
  shopping: Attraction[];
  weather: WeatherInfo;
  budget: BudgetBreakdown;
}
