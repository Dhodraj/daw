import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-16 h-16 text-primary-500" />
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-0 right-1/4 w-8 h-8 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center"
          >
            <span className="text-xl">?</span>
          </motion.div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          404
        </h1>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Page Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Looks like you've taken a wrong turn. The page you're looking for doesn't
          exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/book">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Home className="w-5 h-5" />}
            >
              Book a Ride
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
