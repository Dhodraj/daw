import type { RouteObject } from 'react-router-dom';
import { DriverLayout } from '@/components/templates/DriverLayout';

// Driver pages
import LoginPage from '@/pages/driver/LoginPage';
import StatusPage from '@/pages/driver/StatusPage';
import RequestsPage from '@/pages/driver/RequestsPage';
import NavigatePage from '@/pages/driver/NavigatePage';
import RideInProgressPage from '@/pages/driver/RideInProgressPage';
import EndTripPage from '@/pages/driver/EndTripPage';
import EarningsPage from '@/pages/driver/EarningsPage';
import HistoryPage from '@/pages/driver/HistoryPage';

export const driverRoutes: RouteObject = {
  path: '/driver',
  element: <DriverLayout />,
  children: [
    {
      index: true,
      element: <StatusPage />,
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'status',
      element: <StatusPage />,
    },
    {
      path: 'requests',
      element: <RequestsPage />,
    },
    {
      path: 'ride/:rideId/navigate',
      element: <NavigatePage />,
    },
    {
      path: 'ride/:rideId/in-progress',
      element: <RideInProgressPage />,
    },
    {
      path: 'ride/:rideId/end-trip',
      element: <EndTripPage />,
    },
    {
      path: 'earnings',
      element: <EarningsPage />,
    },
    {
      path: 'history',
      element: <HistoryPage />,
    },
  ],
};
