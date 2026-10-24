import { useState, useEffect } from 'react';
import { EquipmentItem, WIGO_ITEMS } from './wigo-theme';

// Module-level reactive state store for equipment items
let currentItems: EquipmentItem[] = [...WIGO_ITEMS];
const listeners = new Set<(items: EquipmentItem[]) => void>();

export function getWigoItems(): EquipmentItem[] {
  return currentItems;
}

export function addWigoItem(item: EquipmentItem): void {
  currentItems = [item, ...currentItems];
  listeners.forEach((listener) => listener(currentItems));
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
  return true;
}

export function useWigoItems(): [EquipmentItem[], (item: EquipmentItem) => void] {
  const [items, setItems] = useState<EquipmentItem[]>(currentItems);

  useEffect(() => {
    const handleUpdate = (updatedItems: EquipmentItem[]) => {
      setItems(updatedItems);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return [items, addWigoItem];
}
