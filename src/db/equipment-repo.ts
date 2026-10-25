import { db } from './database';
import { EquipmentItem } from '@/constants/wigo-theme';

export async function initDatabase(): Promise<void> {
  await db.init();
}

export async function loadAllEquipment(): Promise<EquipmentItem[]> {
  return await db.getAllEquipment();
}

export async function loadEquipmentById(id: string): Promise<EquipmentItem | undefined> {
  return await db.getEquipmentById(id);
}

export async function saveEquipment(item: EquipmentItem): Promise<void> {
  await db.insertEquipment(item);
}

export async function updateEquipment(item: EquipmentItem): Promise<void> {
  await db.updateEquipment(item);
}

export async function modifyEquipmentStock(id: string, isCheckOut: boolean): Promise<boolean> {
  return await db.updateEquipmentStock(id, isCheckOut);
}

export async function removeEquipment(id: string): Promise<void> {
  await db.deleteEquipment(id);
}

export async function loadCategories(): Promise<string[]> {
  return await db.getAllCategories();
}

export async function saveCategory(name: string): Promise<void> {
  await db.insertCategory(name);
}

export async function resetDatabase(): Promise<void> {
  await db.clearAllData();
}
