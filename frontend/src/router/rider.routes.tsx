import type { RouteObject } from 'react-router-dom';
import { RiderLayout } from '@/components/templates/RiderLayout';

// Lazy load rider pages
import LoginPage from '@/pages/rider/LoginPage';
import HomePage from '@/pages/rider/HomePage';
import SearchingPage from '@/pages/rider/SearchingPage';
import RideStatusPage from '@/pages/rider/RideStatusPage';
import RideInProgressPage from '@/pages/rider/RideInProgressPage';
import RideCompletedPage from '@/pages/rider/RideCompletedPage';
import PaymentsPage from '@/pages/rider/PaymentsPage';
import HistoryPage from '@/pages/rider/HistoryPage';
import SupportPage from '@/pages/rider/SupportPage';

export const riderRoutes: RouteObject = {
  path: '/rider',
  element: <RiderLayout />,
  children: [
    {
      index: true,
      element: <HomePage />,
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'home',
      element: <HomePage />,
    },
    {
      path: 'searching',
      element: <SearchingPage />,
    },
    {
      path: 'ride/:rideId/status',
      element: <RideStatusPage />,
    },
    {
      path: 'ride/:rideId/in-progress',
      element: <RideInProgressPage />,
    },
    {
      path: 'ride/:rideId/completed',
      element: <RideCompletedPage />,
    },
    {
      path: 'payments',
      element: <PaymentsPage />,
    },
    {
      path: 'history',
      element: <HistoryPage />,
    },
    {
      path: 'support',
      element: <SupportPage />,
    },
  ],
};
