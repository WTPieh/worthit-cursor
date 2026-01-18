import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Item, User } from './types';

const KEY_USER = 'worthit:user';
const KEY_ITEMS = 'worthit:items';

export const loadUser = async (): Promise<User | null> => {
  const raw = await AsyncStorage.getItem(KEY_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const saveUser = async (user: User): Promise<void> => {
  await AsyncStorage.setItem(KEY_USER, JSON.stringify(user));
};

export const loadItems = async (): Promise<Item[]> => {
  const raw = await AsyncStorage.getItem(KEY_ITEMS);
  if (!raw) return [];
  try {
    const items = JSON.parse(raw) as Item[];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export const saveItems = async (items: Item[]): Promise<void> => {
  await AsyncStorage.setItem(KEY_ITEMS, JSON.stringify(items));
};

export const clearAll = async (): Promise<void> => {
  await AsyncStorage.multiRemove([KEY_USER, KEY_ITEMS]);
};

export const loadAppState = async (): Promise<AppState> => {
  const [user, items] = await Promise.all([loadUser(), loadItems()]);
  return { user, items };
};

