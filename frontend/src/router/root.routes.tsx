import type { RouteObject } from 'react-router-dom';
import AppSelectorPage from '@/pages/AppSelectorPage';
import NotFoundPage from '@/pages/NotFoundPage';

export const rootRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppSelectorPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
