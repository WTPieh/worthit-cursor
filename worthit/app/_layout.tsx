import { Slot, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { AppProvider, useApp } from '../src/context/AppContext';
import { requestNotificationPermissions, setNotificationHandlers } from '../src/notifications';
import * as Notifications from 'expo-notifications';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';

const Gate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const pendingNavRef = useRef<string | null>(null);

  useEffect(() => {
    setNotificationHandlers();
    requestNotificationPermissions().catch(() => {});
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const itemId = (response.notification.request.content.data as any)?.itemId as string | undefined;
      if (itemId) {
        // Avoid navigating before the root layout mounts; defer until next tick
        router.push(`/item/${itemId}`);
      }
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    const pending = pendingNavRef.current;
    if (!pending) return;
    pendingNavRef.current = null;
    router.push(`/item/${pending}`);
  }, [router]);

  if (!user && pathname !== '/onboarding') {
    // Avoid programmatic navigation from RootLayout (it can run before mount).
    // Instead, render onboarding inline until the user is configured.
    return <OnboardingScreen onDone={() => {}} />;
  }

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <AppProvider>
      <Gate>
        <Slot />
      </Gate>
    </AppProvider>
  );
}

