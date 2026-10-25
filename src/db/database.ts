import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { EquipmentItem } from '@/constants/wigo-theme';

const DB_NAME = 'wigo_inventory.db';

export interface DatabaseAdapter {
  init(): Promise<void>;
  getAllEquipment(): Promise<EquipmentItem[]>;
  getEquipmentById(id: string): Promise<EquipmentItem | undefined>;
  insertEquipment(item: EquipmentItem): Promise<void>;
  updateEquipment(item: EquipmentItem): Promise<void>;
  updateEquipmentStock(id: string, isCheckOut: boolean): Promise<boolean>;
  deleteEquipment(id: string): Promise<void>;
  getAllCategories(): Promise<string[]>;
  insertCategory(name: string): Promise<void>;
  clearAllData(): Promise<void>;
}

// -------------------------------------------------------------
// Native SQLite Implementation (iOS / Android)
// -------------------------------------------------------------
class NativeSQLiteAdapter implements DatabaseAdapter {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    this.db = SQLite.openDatabaseSync(DB_NAME);

    // Create tables
    this.db.execSync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS equipment (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        sku TEXT NOT NULL UNIQUE,
        cost TEXT,
        available_count INTEGER NOT NULL DEFAULT 1,
        out_count INTEGER NOT NULL DEFAULT 0,
        service_count INTEGER NOT NULL DEFAULT 0,
        category TEXT NOT NULL DEFAULT 'available',
        category_name TEXT NOT NULL DEFAULT 'Power Tools',
        image_uri TEXT,
        serial_number TEXT,
        included_in_kit TEXT,
        physical_condition TEXT,
        purchase_invoice TEXT,
        purchase_date TEXT,
        purchase_cost_total TEXT,
        unit_cost TEXT,
        total_quantity INTEGER,
        lending_rate TEXT,
        supplier TEXT,
        invoice_image_uri TEXT,
        warranty_period TEXT,
        earnings_json TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL
      );
    `);

    // Migration: ensure newly added columns exist in older SQLite databases
    try {
      this.db.execSync('ALTER TABLE equipment ADD COLUMN supplier TEXT;');
    } catch {}
    try {
      this.db.execSync('ALTER TABLE equipment ADD COLUMN invoice_image_uri TEXT;');
    } catch {}
    try {
      this.db.execSync('ALTER TABLE equipment ADD COLUMN warranty_period TEXT;');
    } catch {}
  }

  private mapRowToItem(row: any): EquipmentItem {
    let earnings: EquipmentItem['earnings'] = undefined;
    if (row.earnings_json) {
      try {
        earnings = JSON.parse(row.earnings_json);
      } catch {}
    }

    return {
      id: row.id,
      name: row.name,
      sku: row.sku,
      cost: row.cost || 'Rp 0',
      availableCount: Number(row.available_count) || 0,
      outCount: Number(row.out_count) || 0,
      serviceCount: Number(row.service_count) || 0,
      category: row.category as any,
      categoryName: row.category_name,
      imageUri: row.image_uri || undefined,
      serialNumber: row.serial_number || undefined,
      includedInKit: row.included_in_kit || undefined,
      physicalCondition: row.physical_condition || undefined,
      purchaseInvoice: row.purchase_invoice || undefined,
      purchaseDate: row.purchase_date || undefined,
      purchaseCostTotal: row.purchase_cost_total || undefined,
      totalQuantity: row.total_quantity ? Number(row.total_quantity) : undefined,
      lendingRate: row.lending_rate || undefined,
      supplier: row.supplier || undefined,
      invoiceImageUri: row.invoice_image_uri || undefined,
      warrantyPeriod: row.warranty_period || undefined,
      earnings,
    };
  }

  async getAllEquipment(): Promise<EquipmentItem[]> {
    if (!this.db) await this.init();
    const rows = this.db!.getAllSync('SELECT * FROM equipment ORDER BY created_at DESC;');
    return rows.map((r) => this.mapRowToItem(r));
  }

  async getEquipmentById(id: string): Promise<EquipmentItem | undefined> {
    if (!this.db) await this.init();
    const row = this.db!.getFirstSync('SELECT * FROM equipment WHERE id = ?;', [id]);
    return row ? this.mapRowToItem(row) : undefined;
  }

  async insertEquipment(item: EquipmentItem): Promise<void> {
    if (!this.db) await this.init();
    const earningsJson = item.earnings ? JSON.stringify(item.earnings) : null;
    const now = Date.now();

    this.db!.runSync(
      `INSERT OR REPLACE INTO equipment (
        id, name, sku, cost, available_count, out_count, service_count,
        category, category_name, image_uri, serial_number, included_in_kit,
        physical_condition, purchase_invoice, purchase_date, purchase_cost_total,
        total_quantity, lending_rate, supplier, invoice_image_uri, warranty_period,
        earnings_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        item.id,
        item.name,
        item.sku,
        item.cost,
        item.availableCount,
        item.outCount,
        item.serviceCount ?? 0,
        item.category,
        item.categoryName || 'Power Tools',
        item.imageUri || null,
        item.serialNumber || null,
        item.includedInKit || null,
        item.physicalCondition || null,
        item.purchaseInvoice || null,
        item.purchaseDate || null,
        item.purchaseCostTotal || null,
        item.totalQuantity || item.availableCount,
        item.lendingRate || null,
        item.supplier || null,
        item.invoiceImageUri || null,
        item.warrantyPeriod || null,
        earningsJson,
        now,
      ]
    );
  }

  async updateEquipment(item: EquipmentItem): Promise<void> {
    await this.insertEquipment(item);
  }

  async updateEquipmentStock(id: string, isCheckOut: boolean): Promise<boolean> {
    if (!this.db) await this.init();
    const item = await this.getEquipmentById(id);
    if (!item) return false;

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

    const updatedCategory = newAvailable > 0 ? 'available' : 'rented';

    this.db!.runSync(
      `UPDATE equipment SET available_count = ?, out_count = ?, category = ? WHERE id = ?;`,
      [newAvailable, newOut, updatedCategory, id]
    );

    return true;
  }

  async deleteEquipment(id: string): Promise<void> {
    if (!this.db) await this.init();
    this.db!.runSync('DELETE FROM equipment WHERE id = ?;', [id]);
  }

  async getAllCategories(): Promise<string[]> {
    if (!this.db) await this.init();
    const rows = this.db!.getAllSync<{ name: string }>('SELECT name FROM categories ORDER BY name ASC;');
    return rows.map((r) => r.name);
  }

  async insertCategory(name: string): Promise<void> {
    if (!this.db) await this.init();
    const trimmed = name.trim();
    if (!trimmed) return;
    this.db!.runSync(
      'INSERT OR IGNORE INTO categories (id, name, created_at) VALUES (?, ?, ?);',
      [Date.now().toString(), trimmed, Date.now()]
    );
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();
    this.db!.execSync('DELETE FROM equipment; DELETE FROM categories;');
  }
}

// -------------------------------------------------------------
// Web / Fallback Implementation (In-memory + localStorage)
// -------------------------------------------------------------
class WebStorageAdapter implements DatabaseAdapter {
  private items: EquipmentItem[] = [];
  private categories: string[] = [];
  private isLoaded = false;

  private STORAGE_KEY_EQUIPMENT = 'wigo_inventory_items';
  private STORAGE_KEY_CATEGORIES = 'wigo_inventory_categories';

  async init(): Promise<void> {
    if (this.isLoaded) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedItems = window.localStorage.getItem(this.STORAGE_KEY_EQUIPMENT);
        if (storedItems) {
          this.items = JSON.parse(storedItems);
        }
        const storedCats = window.localStorage.getItem(this.STORAGE_KEY_CATEGORIES);
        if (storedCats) {
          this.categories = JSON.parse(storedCats);
        }
      }
    } catch {}
    this.isLoaded = true;
  }

  private persist() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.STORAGE_KEY_EQUIPMENT, JSON.stringify(this.items));
        window.localStorage.setItem(this.STORAGE_KEY_CATEGORIES, JSON.stringify(this.categories));
      }
    } catch {}
  }

  async getAllEquipment(): Promise<EquipmentItem[]> {
    await this.init();
    return [...this.items];
  }

  async getEquipmentById(id: string): Promise<EquipmentItem | undefined> {
    await this.init();
    return this.items.find((item) => item.id === id);
  }

  async insertEquipment(item: EquipmentItem): Promise<void> {
    await this.init();
    const index = this.items.findIndex((i) => i.id === item.id);
    if (index === -1) {
      this.items = [item, ...this.items];
    } else {
      this.items[index] = item;
    }
    this.persist();
  }

  async updateEquipment(item: EquipmentItem): Promise<void> {
    await this.insertEquipment(item);
  }

  async updateEquipmentStock(id: string, isCheckOut: boolean): Promise<boolean> {
    await this.init();
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return false;

    const item = this.items[index];
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

    this.items[index] = updatedItem;
    this.persist();
    return true;
  }

  async deleteEquipment(id: string): Promise<void> {
    await this.init();
    this.items = this.items.filter((i) => i.id !== id);
    this.persist();
  }

  async getAllCategories(): Promise<string[]> {
    await this.init();
    return [...this.categories];
  }

  async insertCategory(name: string): Promise<void> {
    await this.init();
    const trimmed = name.trim();
    if (!trimmed || this.categories.includes(trimmed)) return;
    this.categories.push(trimmed);
    this.persist();
  }

  async clearAllData(): Promise<void> {
    this.items = [];
    this.categories = [];
    this.persist();
  }
}

// Export singleton database adapter depending on platform
export const db: DatabaseAdapter =
  Platform.OS === 'web' ? new WebStorageAdapter() : new NativeSQLiteAdapter();
