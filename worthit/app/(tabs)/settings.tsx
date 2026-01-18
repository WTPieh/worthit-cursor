import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useApp } from '../../src/context/AppContext';
import { calculateNetHourly, clamp, roundTo } from '../../src/utils';
import { clearAll } from '../../src/storage';
import type { IncomeType, User } from '../../src/types';

export default function SettingsScreen() {
  const { user, setUser, replaceItems } = useApp();
  const [incomeType, setIncomeType] = useState<IncomeType>(user?.incomeType ?? 'hourly');
  const [hourlyRate, setHourlyRate] = useState<string>(user?.hourlyRate?.toString() ?? '');
  const [salary, setSalary] = useState<string>(user?.salary?.toString() ?? '');
  const [hoursPerWeek, setHoursPerWeek] = useState<string>((user?.hoursPerWeek ?? 40).toString());
  const [taxEnabled, setTaxEnabled] = useState<boolean>(user?.taxEnabled ?? true);
  const [taxRate, setTaxRate] = useState<string>((user?.taxRate ?? 0.25).toString());

  const netHourly = useMemo(() => {
    const hr = parseFloat(hourlyRate) || 0;
    const sal = parseFloat(salary) || 0;
    const hpw = parseFloat(hoursPerWeek) || 40;
    const tr = clamp(parseFloat(taxRate) || 0.25, 0, 0.9);
    return calculateNetHourly(incomeType, hr, sal, hpw, taxEnabled, tr);
  }, [incomeType, hourlyRate, salary, hoursPerWeek, taxEnabled, taxRate]);

  const handleSave = async () => {
    const next: User = {
      incomeType,
      hourlyRate: parseFloat(hourlyRate) || 0,
      salary: parseFloat(salary) || undefined,
      hoursPerWeek: parseFloat(hoursPerWeek) || 40,
      taxEnabled,
      taxRate: clamp(parseFloat(taxRate) || 0.25, 0, 0.9),
      netHourlyRate: roundTo(netHourly, 2),
    };
    await setUser(next);
    Alert.alert('Saved', 'Income settings updated.');
  };

  const handleClear = async () => {
    Alert.alert('Clear all data?', 'This will remove your income and history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          await setUser(null);
          await replaceItems([]);
          Alert.alert('Cleared', 'All data removed.');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.segmentRow}>
        <TouchableOpacity onPress={() => setIncomeType('hourly')} style={[styles.segment, incomeType === 'hourly' && styles.segmentActive]}>
          <Text style={[styles.segmentText, incomeType === 'hourly' && styles.segmentTextActive]}>Hourly</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIncomeType('salary')} style={[styles.segment, incomeType === 'salary' && styles.segmentActive]}>
          <Text style={[styles.segmentText, incomeType === 'salary' && styles.segmentTextActive]}>Salary</Text>
        </TouchableOpacity>
      </View>

      {incomeType === 'hourly' ? (
        <View>
          <Text style={styles.label}>Hourly rate (gross)</Text>
          <TextInput value={hourlyRate} onChangeText={setHourlyRate} keyboardType="decimal-pad" placeholder="e.g., 35" style={styles.input} />
        </View>
      ) : (
        <View>
          <Text style={styles.label}>Annual salary (gross)</Text>
          <TextInput value={salary} onChangeText={setSalary} keyboardType="decimal-pad" placeholder="e.g., 90000" style={styles.input} />
          <Text style={styles.label}>Hours per week</Text>
          <TextInput value={hoursPerWeek} onChangeText={setHoursPerWeek} keyboardType="decimal-pad" placeholder="40" style={styles.input} />
        </View>
      )}

      <View style={styles.rowCenter}>
        <Text style={styles.label}>Account for taxes</Text>
        <Switch value={taxEnabled} onValueChange={setTaxEnabled} />
      </View>

      {taxEnabled && (
        <View>
          <Text style={styles.label}>Tax rate (0 - 1)</Text>
          <TextInput value={taxRate} onChangeText={setTaxRate} keyboardType="decimal-pad" placeholder="0.25" style={styles.input} />
        </View>
      )}

      <View style={styles.netBox}>
        <Text style={styles.netLabel}>Net hourly rate</Text>
        <Text style={styles.netValue}>${roundTo(netHourly, 2).toFixed(2)}/hr</Text>
      </View>

      <TouchableOpacity onPress={handleSave} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleClear} style={styles.dangerButton}>
        <Text style={styles.dangerButtonText}>Clear history & income</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
      <Text style={{ color: '#6b7280' }}>About</Text>
      <Text>WorthIt helps translate prices into hours of your life. Spend mindfully.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  segmentRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  segment: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, alignItems: 'center' },
  segmentActive: { backgroundColor: '#e5e7eb' },
  segmentText: { color: '#374151' },
  segmentTextActive: { fontWeight: '600' },
  label: { color: '#374151', marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 8 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
  netBox: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 16, marginTop: 8, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between' },
  netLabel: { color: '#6b7280' },
  netValue: { fontSize: 18, fontWeight: '700' },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, marginTop: 8 },
  primaryButtonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  dangerButton: { backgroundColor: '#ef4444', borderRadius: 8, padding: 14, marginTop: 12 },
  dangerButtonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
});

