import { Slot, usePathname, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Tab = {
  key: 'evaluate' | 'history' | 'settings';
  label: string;
  href: string;
};

const tabs: Tab[] = [
  { key: 'evaluate', label: 'Evaluate', href: '/(tabs)' },
  { key: 'history', label: 'History', href: '/(tabs)/history' },
  { key: 'settings', label: 'Settings', href: '/(tabs)/settings' },
];

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const activeKey = useMemo<Tab['key']>(() => {
    if (pathname === '/(tabs)' || pathname === '/(tabs)/index') return 'evaluate';
    if (pathname.startsWith('/(tabs)/history')) return 'history';
    if (pathname.startsWith('/(tabs)/settings')) return 'settings';
    return 'evaluate';
  }, [pathname]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.nav} accessibilityRole="tablist">
        {tabs.map((t) => {
          const isActive = t.key === activeKey;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => router.replace(t.href)}
              style={[styles.navItem, isActive && styles.navItemActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t.label}
            >
              <Text style={[styles.navText, isActive && styles.navTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1 },
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: 'white',
  },
  navItem: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  navItemActive: { backgroundColor: '#111827' },
  navText: { color: '#111827', fontWeight: '600' },
  navTextActive: { color: 'white' },
});

