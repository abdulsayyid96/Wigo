import { useState, useEffect } from 'react';
import { EquipmentItem } from './wigo-theme';
import {
  initDatabase,
  loadAllEquipment,
  saveEquipment,
  updateEquipment,
  modifyEquipmentStock,
  removeEquipment,
} from '@/db/equipment-repo';

// In-memory cache synced with SQLite local database.
// Clean empty database starts with 0 items (as configured in design interview).
let currentItems: EquipmentItem[] = [];
let isDbLoaded = false;
let initPromise: Promise<void> | null = null;
const listeners = new Set<(items: EquipmentItem[]) => void>();

/**
 * Ensures SQLite database is initialized and loaded into memory cache.
 */
export async function ensureDatabaseLoaded(): Promise<void> {
  if (isDbLoaded) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await initDatabase();
        const loaded = await loadAllEquipment();
        currentItems = loaded;
        isDbLoaded = true;
        listeners.forEach((listener) => listener(currentItems));
      } catch (err) {
        console.error('Failed to initialize local SQLite database:', err);
      }
    })();
  }
  return initPromise;
}

// Auto-trigger database initialization on module import
ensureDatabaseLoaded();

export function getWigoItems(): EquipmentItem[] {
  return currentItems;
}

export function getWigoItemById(id: string): EquipmentItem | undefined {
  return currentItems.find((item) => item.id === id);
}

export function addWigoItem(item: EquipmentItem): void {
  currentItems = [item, ...currentItems.filter((i) => i.id !== item.id)];
  listeners.forEach((listener) => listener(currentItems));
  saveEquipment(item).catch((err) =>
    console.error('Failed to persist equipment to SQLite:', err)
  );
}

export function updateWigoItem(updatedItem: EquipmentItem): boolean {
  const index = currentItems.findIndex((item) => item.id === updatedItem.id);
  if (index === -1) {
    currentItems = [updatedItem, ...currentItems];
  } else {
    currentItems = [
      ...currentItems.slice(0, index),
      updatedItem,
      ...currentItems.slice(index + 1),
    ];
  }
  listeners.forEach((listener) => listener(currentItems));
  updateEquipment(updatedItem).catch((err) =>
    console.error('Failed to update equipment in SQLite:', err)
  );
  return true;
}

export function updateWigoItemStock(id: string, isCheckOut: boolean): boolean {
  const index = currentItems.findIndex((item) => item.id === id);
  if (index === -1) return false;

  const item = currentItems[index];
  let newAvailable = item.availableCount;
  let newOut = item.outCount;

  if (isCheckOut) {
    if (newAvailable <= 0) return false;
    newAvailable -= 1;
    newOut += 1;
  } else {
    if (newOut <= 0) return false;
    newOut -= 1;
    newAvailable += 1;
  }

  const updatedItem: EquipmentItem = {
    ...item,
    availableCount: newAvailable,
    outCount: newOut,
    category: newAvailable > 0 ? 'available' : 'rented',
  };

  currentItems = [
    ...currentItems.slice(0, index),
    updatedItem,
    ...currentItems.slice(index + 1),
  ];
  listeners.forEach((listener) => listener(currentItems));
  modifyEquipmentStock(id, isCheckOut).catch((err) =>
    console.error('Failed to update stock in SQLite:', err)
  );
  return true;
}

export function deleteWigoItem(id: string): void {
  currentItems = currentItems.filter((i) => i.id !== id);
  listeners.forEach((listener) => listener(currentItems));
  removeEquipment(id).catch((err) =>
    console.error('Failed to remove equipment from SQLite:', err)
  );
}

export function useWigoItems(): [
  EquipmentItem[],
  (item: EquipmentItem) => void,
  boolean
] {
  const [items, setItems] = useState<EquipmentItem[]>(currentItems);
  const [isReady, setIsReady] = useState(isDbLoaded);

  useEffect(() => {
    ensureDatabaseLoaded().then(() => {
      setItems(currentItems);
      setIsReady(true);
    });

    const handleUpdate = (updatedItems: EquipmentItem[]) => {
      setItems(updatedItems);
      setIsReady(true);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return [items, addWigoItem, isReady];
}
