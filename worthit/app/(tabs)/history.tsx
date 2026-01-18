import React, { useMemo, useState } from 'react';
import { FlatList, Linking, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useApp } from '../../src/context/AppContext';
import { FilterStatus, Item } from '../../src/types';
import { formatCurrency, humanizeHours } from '../../src/utils';

const ItemRow: React.FC<{ item: Item }> = ({ item }) => {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{formatCurrency(item.price)} • {humanizeHours(item.hoursRequired)}</Text>
        <Text style={styles.rowSub}>
          {new Date(item.createdAt).toLocaleString()} • {item.status.toUpperCase()}
        </Text>
        {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
        {item.link ? (
          <Text onPress={() => Linking.openURL(item.link!)} style={styles.rowLink} accessibilityRole="link">
            {item.link}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default function HistoryScreen() {
  const { items } = useApp();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((it) => it.status === filter);
  }, [items, filter]);

  const totalEvaluated = items.length;
  const passedCount = items.filter((i) => i.status === 'passed').length;
  const moneySaved = items.filter((i) => i.status === 'passed').reduce((sum, i) => sum + i.price, 0);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.stats}>
        <Text style={styles.statsItem}>Evaluated: {totalEvaluated}</Text>
        <Text style={styles.statsItem}>Passed: {passedCount}</Text>
        <Text style={styles.statsItem}>Saved: {formatCurrency(moneySaved)}</Text>
      </View>

      <View style={styles.filters}>
        {(['all', 'pending', 'bought', 'passed'] as FilterStatus[]).map((s) => (
          <TouchableOpacity key={s} onPress={() => setFilter(s)} style={[styles.filterChip, filter === s && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>{s.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => <ItemRow item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  statsItem: { fontWeight: '600' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  filterChip: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  filterChipActive: { backgroundColor: '#e5e7eb' },
  filterText: { color: '#374151' },
  filterTextActive: { fontWeight: '700' },
  row: { flexDirection: 'row', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 },
  rowTitle: { fontWeight: '700' },
  rowSub: { color: '#6b7280', marginTop: 2 },
  rowNote: { marginTop: 4 },
  rowLink: { color: '#2563eb', marginTop: 2 },
});

