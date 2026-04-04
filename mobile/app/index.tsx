import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { readGuestOnboardingSeen } from '@/lib/guest/onboarding';
import { LoadingScreen } from '@/components/guest/primitives';

export default function IndexScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const resolveRoute = async () => {
      if (isLoading) {
        return;
      }

      if (isAuthenticated) {
        router.replace('/(tabs)');
        return;
      }

      const hasSeenOnboarding = await readGuestOnboardingSeen();
      if (cancelled) {
        return;
      }

      router.replace(hasSeenOnboarding ? '/(tabs)' : '/get-started');
    };

    void resolveRoute();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, router]);

  return <LoadingScreen message="Preparing Al Hilal..." />;
}
