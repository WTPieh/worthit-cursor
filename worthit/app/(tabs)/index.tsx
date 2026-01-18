import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useApp } from '../../src/context/AppContext';
import { describeEffort, formatCurrency, humanizeHours } from '../../src/utils';
import { useRouter } from 'expo-router';
import { scheduleReminder } from '../../src/notifications';
import { addDays } from '../../src/utils';

export default function EvaluateScreen() {
  const { user, addItem, updateItem } = useApp();
  const [priceInput, setPriceInput] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const router = useRouter();

  const price = useMemo(() => {
    const numeric = parseFloat(priceInput.replace(/[^0-9.]/g, '')) || 0;
    return numeric;
  }, [priceInput]);

  const netHourly = user?.netHourlyRate ?? 0;
  const hoursRequired = useMemo(() => (netHourly > 0 ? price / netHourly : 0), [price, netHourly]);

  const handleCalculate = () => {
    if (!user) {
      Alert.alert('Setup needed', 'Please complete onboarding to set your income.');
      router.push('/onboarding');
      return;
    }
    if (price <= 0) {
      Alert.alert('Enter a price', 'Please enter a valid price greater than 0.');
      return;
    }
  };

  const handleWorthIt = async () => {
    if (!user) return;
    const item = await addItem(price, note || undefined, link || undefined, 'bought');
    setNote('');
    setLink('');
    setPriceInput('');
    Alert.alert('Logged', 'Marked as purchased.');
    router.push('/(tabs)/history');
  };

  const schedule = async (days: number) => {
    if (!user) return;
    const item = await addItem(price, note || undefined, link || undefined, 'pending');
    const date = addDays(new Date(), days);
    await scheduleReminder(date, { itemId: item.id }, 'Is it worth it?', 'Time to decide on your item.');
    await updateItem(item.id, { reminderAt: date.toISOString() });
    setNote('');
    setLink('');
    setPriceInput('');
    Alert.alert('Reminder set', `We’ll remind you in ${days} day${days === 1 ? '' : 's'}.`);
  };

  const handleCustomReminder = () => {
    Alert.prompt(
      'Custom Reminder (minutes)',
      'Enter minutes from now (e.g., 60):',
      async (text) => {
        const mins = parseInt(text || '0', 10);
        if (!isFinite(mins) || mins <= 0) {
          Alert.alert('Invalid', 'Please enter a positive number.');
          return;
        }
        const item = await addItem(price, note || undefined, link || undefined, 'pending');
        const date = new Date(Date.now() + mins * 60_000);
        await scheduleReminder(date, { itemId: item.id }, 'Is it worth it?', 'Time to decide on your item.');
        await updateItem(item.id, { reminderAt: date.toISOString() });
        setNote('');
        setLink('');
        setPriceInput('');
        Alert.alert('Reminder set', `We’ll remind you in ${mins} minutes.`);
      }
    );
  };

  const disabled = !user || price <= 0;

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>How much does it cost?</Text>
        <TextInput
          value={priceInput}
          onChangeText={setPriceInput}
          placeholder="$0.00"
          inputMode="decimal"
          keyboardType="decimal-pad"
          style={styles.input}
          onBlur={handleCalculate}
        />
        <Text style={styles.label}>Optional note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="What is it?"
          style={styles.input}
        />
        <Text style={styles.label}>Optional link</Text>
        <TextInput
          value={link}
          onChangeText={setLink}
          placeholder="https://..."
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { marginBottom: 24 }]}
        />

        <View style={styles.resultCard}>
          <Text style={styles.resultCurrency}>{formatCurrency(price)} =</Text>
          <Text style={styles.resultHours}>{humanizeHours(hoursRequired)}</Text>
          <Text style={styles.resultEffort}>{describeEffort(hoursRequired)}</Text>
        </View>

        <TouchableOpacity
          disabled={disabled}
          onPress={handleWorthIt}
          style={[styles.primaryButton, disabled && styles.disabledButton]}
          accessibilityRole="button"
          accessibilityLabel="Worth it"
        >
          <Text style={styles.primaryButtonText}>Worth it</Text>
        </TouchableOpacity>

        <Text style={styles.or}>or</Text>

        <Text style={styles.subTitle}>Let me think...</Text>
        <View style={styles.row}>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => schedule(1)}
            style={[styles.secondaryButton, disabled && styles.disabledButton]}
            accessibilityRole="button"
            accessibilityLabel="Remind in 1 day"
          >
            <Text style={styles.secondaryButtonText}>1 day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => schedule(3)}
            style={[styles.secondaryButton, disabled && styles.disabledButton]}
            accessibilityRole="button"
            accessibilityLabel="Remind in 3 days"
          >
            <Text style={styles.secondaryButtonText}>3 days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => schedule(7)}
            style={[styles.secondaryButton, disabled && styles.disabledButton]}
            accessibilityRole="button"
            accessibilityLabel="Remind in 1 week"
          >
            <Text style={styles.secondaryButtonText}>1 week</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={disabled}
          onPress={handleCustomReminder}
          style={styles.customButton}
          accessibilityRole="button"
          accessibilityLabel="Custom reminder"
        >
          <Text style={styles.customButtonText}>Custom...</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  label: { color: '#4b5563', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  resultCard: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultCurrency: { fontSize: 16 },
  resultHours: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  resultEffort: { fontSize: 16, marginTop: 8 },
  primaryButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  primaryButtonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  disabledButton: { opacity: 0.5 },
  or: { textAlign: 'center', color: '#6b7280', marginVertical: 8 },
  subTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' as const },
  secondaryButton: { flex: 1, backgroundColor: '#2563eb', borderRadius: 8, padding: 14 },
  secondaryButtonText: { color: 'white', textAlign: 'center' },
  customButton: { marginTop: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 14 },
  customButtonText: { textAlign: 'center' },
});

