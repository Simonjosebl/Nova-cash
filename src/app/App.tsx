import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { SplashScreen } from '@/app/screens/SplashScreen';
import { router } from '@/app/router/router';

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Suspense fallback={<SplashScreen />}>
          <RouterProvider router={router} />
        </Suspense>
      </AppProviders>
    </ErrorBoundary>
  );
}
