import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { LoadingScreen } from '@/components/guest/primitives';

export default function IndexScreen() {
  const router = useRouter();
  const { isLoading } = useAuth();

  useEffect(() => {
    const resolveRoute = async () => {
      if (isLoading) {
        return;
      }

      router.replace('/(tabs)');
    };

    void resolveRoute();
  }, [isLoading, router]);

  return <LoadingScreen message="Preparing Al Hilal..." />;
}
