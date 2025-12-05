import { openDB } from 'idb';

const DB_NAME = 'mos-pool-db';
const DB_VERSION = 1;

/**
 * Initialize IndexedDB database
 * Creates object stores for products, estimates, templates, and clients
 */
export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Products catalog
            if (!db.objectStoreNames.contains('products')) {
                const productStore = db.createObjectStore('products', { 
                    keyPath: 'id', 
                    autoIncrement: false 
                });
                productStore.createIndex('category', 'category', { unique: false });
                productStore.createIndex('name', 'name', { unique: false });
            }

            // Estimates (already in localStorage, but can migrate here later)
            if (!db.objectStoreNames.contains('estimates')) {
                const estimateStore = db.createObjectStore('estimates', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                estimateStore.createIndex('createdAt', 'createdAt', { unique: false });
                estimateStore.createIndex('clientName', 'clientInfo.name', { unique: false });
            }

            // Templates
            if (!db.objectStoreNames.contains('templates')) {
                const templateStore = db.createObjectStore('templates', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                templateStore.createIndex('name', 'name', { unique: false });
            }

            // Clients (for future use)
            if (!db.objectStoreNames.contains('clients')) {
                const clientStore = db.createObjectStore('clients', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                clientStore.createIndex('name', 'name', { unique: false });
                clientStore.createIndex('phone', 'phone', { unique: false });
            }
        },
    });
};

/**
 * Get database instance
 */
export const getDB = async () => {
    return initDB();
};

/**
 * Clear all data from database (for testing/reset)
 */
export const clearDB = async () => {
    const db = await getDB();
    const stores = ['products', 'estimates', 'templates', 'clients'];
    
    for (const storeName of stores) {
        const tx = db.transaction(storeName, 'readwrite');
        await tx.objectStore(storeName).clear();
        await tx.done;
    }
};

/**
 * Export all data from database
 */
export const exportData = async () => {
    const db = await getDB();
    
    return {
        products: await db.getAll('products'),
        estimates: await db.getAll('estimates'),
        templates: await db.getAll('templates'),
        clients: await db.getAll('clients'),
        timestamp: new Date().toISOString(),
        version: '4.0'
    };
};

/**
 * Import data into database
 */
export const importData = async (data: any) => {
    const db = await getDB();
    
    // Clear existing data
    await clearDB();
    
    // Import products
    if (data.products) {
        const tx = db.transaction('products', 'readwrite');
        for (const product of data.products) {
            await tx.store.put(product);
        }
        await tx.done;
    }
    
    // Import estimates
    if (data.estimates) {
        const tx = db.transaction('estimates', 'readwrite');
        for (const estimate of data.estimates) {
            await tx.store.put(estimate);
        }
        await tx.done;
    }
    
    // Import templates
    if (data.templates) {
        const tx = db.transaction('templates', 'readwrite');
        for (const template of data.templates) {
            await tx.store.put(template);
        }
        await tx.done;
    }
    
    // Import clients
    if (data.clients) {
        const tx = db.transaction('clients', 'readwrite');
        for (const client of data.clients) {
            await tx.store.put(client);
        }
        await tx.done;
    }
};
