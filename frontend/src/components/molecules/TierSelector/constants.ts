import { Car, Sparkles, Crown, Users, type LucideIcon } from 'lucide-react';
import { RideTier } from '@/types';

export interface TierOption {
  value: RideTier;
  label: string;
  description: string;
  basePrice: string;
  icon: LucideIcon;
  gradient: string;
}

export const defaultTierOptions: TierOption[] = [
  {
    value: RideTier.ECONOMY,
    label: 'Economy',
    description: 'Affordable everyday rides',
    basePrice: '₹50',
    icon: Car,
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    value: RideTier.COMFORT,
    label: 'Comfort',
    description: 'Spacious sedans with AC',
    basePrice: '₹80',
    icon: Sparkles,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    value: RideTier.PREMIUM,
    label: 'Premium',
    description: 'Luxury cars, top-rated drivers',
    basePrice: '₹120',
    icon: Crown,
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    value: RideTier.XL,
    label: 'XL',
    description: 'Perfect for groups of 4-6',
    basePrice: '₹100',
    icon: Users,
    gradient: 'from-purple-500 to-purple-600',
  },
];
