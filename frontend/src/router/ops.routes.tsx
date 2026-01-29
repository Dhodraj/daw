import type { RouteObject } from 'react-router-dom';
import { OpsLayout } from '@/components/templates/OpsLayout';

// Ops/Admin pages
import OverviewPage from '@/pages/ops/OverviewPage';
import RidesPage from '@/pages/ops/RidesPage';
import DriversPage from '@/pages/ops/DriversPage';
import RegionsPage from '@/pages/ops/RegionsPage';
import SurgePricingPage from '@/pages/ops/SurgePricingPage';
import PaymentsPage from '@/pages/ops/PaymentsPage';
import AlertsPage from '@/pages/ops/AlertsPage';

export const opsRoutes: RouteObject = {
  path: '/ops',
  element: <OpsLayout />,
  children: [
    {
      index: true,
      element: <OverviewPage />,
    },
    {
      path: 'overview',
      element: <OverviewPage />,
    },
    {
      path: 'rides',
      element: <RidesPage />,
    },
    {
      path: 'drivers',
      element: <DriversPage />,
    },
    {
      path: 'regions',
      element: <RegionsPage />,
    },
    {
      path: 'surge-pricing',
      element: <SurgePricingPage />,
    },
    {
      path: 'payments',
      element: <PaymentsPage />,
    },
    {
      path: 'alerts',
      element: <AlertsPage />,
    },
  ],
};
