import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { AppProvider, useApp } from '../src/context/AppContext';
import { requestNotificationPermissions, setNotificationHandlers } from '../src/notifications';
import * as Notifications from 'expo-notifications';

const Gate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setNotificationHandlers();
    requestNotificationPermissions().catch(() => {});
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const itemId = (response.notification.request.content.data as any)?.itemId as string | undefined;
      if (itemId) {
        router.push(`/item/${itemId}`);
      }
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (!user && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [user, pathname, router]);

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <AppProvider>
      <Gate>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ title: 'Welcome' }} />
          <Stack.Screen name="item/[id]" options={{ title: 'Evaluate Item' }} />
        </Stack>
      </Gate>
    </AppProvider>
  );
}

