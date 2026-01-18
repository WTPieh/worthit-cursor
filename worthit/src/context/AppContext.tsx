import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Item, ItemStatus, User } from '../types';
import { loadAppState, saveItems, saveUser } from '../storage';
import { computeHoursRequired, nowIso } from '../utils';

type AppContextValue = {
  user: User | null;
  items: Item[];
  setUser: (u: User | null) => Promise<void>;
  addItem: (price: number, note?: string, link?: string, status?: ItemStatus, reminderAt?: string) => Promise<Item>;
  updateItem: (id: string, partial: Partial<Item>) => Promise<void>;
  replaceItems: (items: Item[]) => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    loadAppState().then(({ user, items }) => {
      setUserState(user);
      setItems(items);
    });
  }, []);

  const setUser = useCallback(async (u: User | null) => {
    setUserState(u);
    if (u) {
      await saveUser(u);
    }
  }, []);

  const addItem = useCallback(
    async (price: number, note?: string, link?: string, status: ItemStatus = 'pending', reminderAt?: string) => {
      const net = user?.netHourlyRate ?? 0;
      const hoursRequired = computeHoursRequired(price, net);
      const item: Item = {
        id: (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)),
        price,
        hoursRequired,
        createdAt: nowIso(),
        status,
        reminderAt,
        note,
        link,
      };
      const next = [item, ...items];
      setItems(next);
      await saveItems(next);
      return item;
    },
    [items, user?.netHourlyRate]
  );

  const updateItem = useCallback(
    async (id: string, partial: Partial<Item>) => {
      const next = items.map((it) => (it.id === id ? { ...it, ...partial } : it));
      setItems(next);
      await saveItems(next);
    },
    [items]
  );

  const replaceItems = useCallback(async (nextItems: Item[]) => {
    setItems(nextItems);
    await saveItems(nextItems);
  }, []);

  const value = useMemo(
    () => ({ user, items, setUser, addItem, updateItem, replaceItems }),
    [user, items, setUser, addItem, updateItem, replaceItems]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

