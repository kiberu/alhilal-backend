import React from 'react';
import { useRouter } from 'expo-router';

/**
 * Legacy login route - redirects to phone-login
 * Kept for backwards compatibility with any deep links or navigation references
 */
export default function LoginScreen() {
  const router = useRouter();
  
  React.useEffect(() => {
    router.replace('/(auth)/phone-login');
  }, []);
  
  return null;
}
