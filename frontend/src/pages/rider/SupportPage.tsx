import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  Search,
  Shield,
  CreditCard,
  Car,
  MapPin,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    question: 'How do I cancel a ride?',
    answer: 'You can cancel a ride before the driver arrives by tapping the "Cancel Ride" button in the ride status screen. Cancellation fees may apply if the driver is already on the way.',
    category: 'rides',
  },
  {
    question: 'How do I change my payment method?',
    answer: 'Go to the Payments section in the app and tap "Add payment method" to add a new card or select an existing payment method as your default.',
    category: 'payment',
  },
  {
    question: 'What if I left something in the car?',
    answer: 'Contact your driver through the ride history section. If you cannot reach them, contact our support team and we\'ll help coordinate the return of your items.',
    category: 'rides',
  },
  {
    question: 'How are fares calculated?',
    answer: 'Fares are calculated based on distance, time, and current demand (surge pricing). You\'ll always see an estimated fare before confirming your ride.',
    category: 'payment',
  },
  {
    question: 'Is my personal information safe?',
    answer: 'Yes, we use industry-standard encryption to protect your data. Your payment details are never stored on our servers and all communications are encrypted.',
    category: 'safety',
  },
];

const categories = [
  { id: 'rides', label: 'Rides', icon: Car },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'safety', label: 'Safety', icon: Shield },
  { id: 'account', label: 'Account', icon: MapPin },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCategory && faq.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            How can we help?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Search our help center or contact support
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-lg"
          />
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-slate-100">Live Chat</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Available 24/7</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors">
            <div className="w-10 h-10 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-success-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-slate-100">Call Us</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">1-800-SWIFT</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors">
            <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900/30 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-warning-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-slate-100">Email</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">support@swift.com</p>
            </div>
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              !selectedCategory
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            All Topics
          </button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No results found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFaqs.map((faq, index) => (
                <div key={index}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-100 pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-slate-400 transition-transform flex-shrink-0',
                        expandedFaq === index && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* More Resources */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">
              More Resources
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <a
              href="#"
              className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">Terms of Service</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">Privacy Policy</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">Safety Guidelines</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
