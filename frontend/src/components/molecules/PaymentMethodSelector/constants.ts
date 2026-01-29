import { Banknote, CreditCard, Wallet, type LucideIcon } from 'lucide-react';
import { PaymentMethod } from '@/types';

export interface PaymentOption {
  value: PaymentMethod;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export const defaultPaymentOptions: PaymentOption[] = [
  { value: PaymentMethod.CASH, label: 'Cash', icon: Banknote },
  { value: PaymentMethod.CARD, label: 'Card', icon: CreditCard },
  { value: PaymentMethod.WALLET, label: 'Wallet', icon: Wallet },
];
