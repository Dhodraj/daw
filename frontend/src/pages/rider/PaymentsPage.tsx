import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Check,
  Trash2,
  Wallet,
  Building2,
  Gift,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  name: string;
  details: string;
  isDefault: boolean;
  icon: typeof CreditCard;
}

export default function PaymentsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', name: 'Visa', details: '•••• 4242', isDefault: true, icon: CreditCard },
    { id: '2', type: 'card', name: 'Mastercard', details: '•••• 8888', isDefault: false, icon: CreditCard },
    { id: '3', type: 'wallet', name: 'SwiftRide Wallet', details: '$45.00 balance', isDefault: false, icon: Wallet },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);

  const setDefaultMethod = (id: string) => {
    setMethods(methods.map(m => ({
      ...m,
      isDefault: m.id === id,
    })));
  };

  const removeMethod = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Payment Methods
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your payment options for rides
          </p>
        </div>

        {/* Payment Methods List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700 overflow-hidden mb-6">
          {methods.map((method, index) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-4 p-4',
                  index !== methods.length - 1 && 'border-b border-slate-100 dark:border-slate-800'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  method.type === 'card' && 'bg-primary-100 dark:bg-primary-900/30',
                  method.type === 'wallet' && 'bg-success-100 dark:bg-success-900/30',
                  method.type === 'bank' && 'bg-slate-100 dark:bg-slate-800'
                )}>
                  <Icon className={cn(
                    'w-6 h-6',
                    method.type === 'card' && 'text-primary-500',
                    method.type === 'wallet' && 'text-success-500',
                    method.type === 'bank' && 'text-slate-500'
                  )} />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {method.name}
                    </p>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {method.details}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefaultMethod(method.id)}
                      className="p-2 text-slate-400 hover:text-primary-500 transition-colors"
                      title="Set as default"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeMethod(method.id)}
                    className="p-2 text-slate-400 hover:text-error-500 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Add New */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-slate-500" />
            </div>
            <span className="font-medium text-slate-600 dark:text-slate-400">
              Add payment method
            </span>
          </button>
        </div>

        {/* Promo & Gift Cards */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700 overflow-hidden mb-6">
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-warning-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  Add Promo Code
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Apply discounts to your rides
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-violet-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  Redeem Gift Card
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add ride credits to your account
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Security Note */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Your payment info is secure
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                We use industry-standard encryption to protect your data. Your card details are never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Payment Modal Placeholder */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                Add Payment Method
              </h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 transition-colors">
                  <CreditCard className="w-6 h-6 text-primary-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    Credit or Debit Card
                  </span>
                </button>
                <button className="w-full flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 transition-colors">
                  <Building2 className="w-6 h-6 text-slate-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    Bank Account
                  </span>
                </button>
                <button className="w-full flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 transition-colors">
                  <Wallet className="w-6 h-6 text-success-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    Digital Wallet
                  </span>
                </button>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full mt-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
