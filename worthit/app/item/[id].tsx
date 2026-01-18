import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../../src/context/AppContext';
import { formatCurrency, humanizeHours } from '../../src/utils';
import { scheduleReminder } from '../../src/notifications';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, updateItem } = useApp();
  const router = useRouter();

  const item = useMemo(() => items.find((i) => i.id === id), [items, id]);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>Item not found.</Text>
      </View>
    );
  }

  const handleBuy = async () => {
    await updateItem(item.id, { status: 'bought' });
    Alert.alert('Updated', 'Marked as purchased.');
    router.back();
  };

  const handlePass = async () => {
    await updateItem(item.id, { status: 'passed' });
    Alert.alert('Nice!', 'Marked as passed. Money saved!');
    router.back();
  };

  const handleSnooze = async () => {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await scheduleReminder(date, { itemId: item.id }, 'Still thinking?', 'Another day to decide.');
    await updateItem(item.id, { reminderAt: date.toISOString(), status: 'pending' });
    Alert.alert('Snoozed', 'We’ll remind you again tomorrow.');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evaluate</Text>
      <Text style={styles.value}>{formatCurrency(item.price)}</Text>
      <Text style={styles.sub}>{humanizeHours(item.hoursRequired)}</Text>
      <Text style={styles.sub}>Status: {item.status.toUpperCase()}</Text>

      <View style={{ height: 16 }} />
      <TouchableOpacity onPress={handleBuy} style={styles.buy}>
        <Text style={styles.btnText}>Buy</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePass} style={styles.pass}>
        <Text style={styles.btnText}>Pass</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSnooze} style={styles.snooze}>
        <Text style={styles.btnText}>Snooze 1 day</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  value: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  sub: { color: '#6b7280', marginTop: 6 },
  buy: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, marginTop: 16 },
  pass: { backgroundColor: '#ef4444', padding: 14, borderRadius: 8, marginTop: 12 },
  snooze: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, marginTop: 12 },
  btnText: { color: 'white', textAlign: 'center', fontWeight: '600' },
});

