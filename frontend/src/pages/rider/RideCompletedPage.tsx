import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  MessageSquare,
  Receipt,
  MapPin,
  Clock,
  CreditCard,
  ChevronRight,
  Check,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function RideCompletedPage() {
  const { rideId } = useParams(); // Will be used for API calls
  void rideId; // Placeholder for future API integration
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [tip, setTip] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Mock ride data
  const ride = {
    driver: 'John Smith',
    fare: 24.50,
    distance: '8.3 km',
    duration: '18 min',
    pickup: '123 Main Street',
    dropoff: '456 Oak Avenue',
    paymentMethod: 'Visa •••• 4242',
    date: 'Today, 3:45 PM',
  };

  const tipOptions = [2, 5, 10];

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      navigate('/rider/home');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-success-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Thank you!
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Your feedback helps improve SwiftRide
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Trip Completed
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {ride.date}
          </p>
        </div>

        {/* Fare Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700 p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Fare</p>
            <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              ${ride.fare.toFixed(2)}
            </p>
          </div>

          {/* Trip Summary */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Distance</span>
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-100">{ride.distance}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Duration</span>
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-100">{ride.duration}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Payment</span>
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-100">{ride.paymentMethod}</span>
            </div>
          </div>

          {/* Receipt Link */}
          <button className="w-full flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-slate-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">View Receipt</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Rating Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700 p-6 mb-6">
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-xl font-bold">
              {ride.driver.charAt(0)}
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{ride.driver}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">How was your ride?</p>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'w-10 h-10 transition-colors',
                    (hoveredRating || rating) >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-300 dark:text-slate-600'
                  )}
                />
              </button>
            ))}
          </div>

          {/* Quick Feedback */}
          {rating > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {['Great driver', 'Clean car', 'Good music', 'Safe driving', 'Friendly'].map((tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Comment */}
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  placeholder="Add a comment (optional)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={2}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Tip Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700 p-6 mb-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-center mb-4">
            Add a tip?
          </h3>
          <div className="flex gap-3 justify-center">
            {tipOptions.map((amount) => (
              <button
                key={amount}
                onClick={() => setTip(tip === amount ? null : amount)}
                className={cn(
                  'px-6 py-3 rounded-xl font-medium transition-all',
                  tip === amount
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30"
        >
          Submit & Go Home
        </button>

        {/* Skip Link */}
        <Link
          to="/rider/home"
          className="block text-center mt-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        >
          Skip for now
        </Link>
      </motion.div>
    </div>
  );
}
