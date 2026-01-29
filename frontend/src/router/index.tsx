import { createBrowserRouter } from 'react-router-dom';
import { riderRoutes } from './rider.routes';
import { driverRoutes } from './driver.routes';
import { opsRoutes } from './ops.routes';
import { rootRoutes } from './root.routes';

export const router = createBrowserRouter([
  // App routes
  riderRoutes,
  driverRoutes,
  opsRoutes,
  // Root routes (app selector, 404)
  ...rootRoutes,
]);
