// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
  photoURL?: string;
}

// Cycle tracking types
export interface CycleDay {
  date: string;
  flow?: 'light' | 'medium' | 'heavy' | 'none';
  symptoms?: string[];
  mood?: 'happy' | 'sad' | 'anxious' | 'irritable' | 'neutral';
  notes?: string;
  temperature?: number;
}

export interface CycleData {
  cycleLength: number;
  periodLength: number;
  id: string;
  userId: string;
  startDate: string;
  endDate?: string;
  duration?: number;
  days: CycleDay[];
  predictedNextStart?: string;
  predictedNextEnd?: string;
}

// Health tracking types
export interface BMIData {
  id: string;
  userId: string;
  date: string;
  height: number; // in cm
  weight: number; // in kg
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
}

export interface SymptomLog {
  id: string;
  userId: string;
  date: string;
  symptoms: string[];
  severity: number; // 1-10
  notes?: string;
}

// Disease prediction types
export interface DiseaseRiskAssessment {
  id: string;
  userId: string;
  date: string;
  condition: 'breast_cancer' | 'pcos' | 'pcod';
  riskScore: number; // 0-100
  symptoms: string[];
  recommendations: string[];
}

// E-commerce types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  inStock: boolean;
  rating?: number;
  details?: {
    ingredients?: string[];
    usage?: string;
    benefits?: string[];
    warnings?: string[];
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Appointment types
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  photoURL: string;
  availability: {
    [date: string]: string[]; // Array of available time slots
  };
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  virtual: boolean;
  meetingLink?: string;
}

// Diet and nutrition types
export interface MealPlan {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  dailyPlans: {
    [date: string]: {
      breakfast: Meal;
      lunch: Meal;
      dinner: Meal;
      snacks: Meal[];
    };
  };
  targetCalories: number;
  dietType: string;
  healthGoals: string[];
}

export interface Meal {
  name: string;
  ingredients: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recipeUrl?: string;
  imageUrl?: string;
}