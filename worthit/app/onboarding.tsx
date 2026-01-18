import { useRouter } from 'expo-router';
import React from 'react';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';

export default function OnboardingRoute() {
  const router = useRouter();
  return <OnboardingScreen onDone={() => router.replace('/(tabs)')} />;
}
