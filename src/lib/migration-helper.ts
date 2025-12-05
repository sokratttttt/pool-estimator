/**
 * Migration Helper Utilities
 * Helps transition from Context API to Zustand without breaking existing components
 */

// Adapter pattern for existing components
export const createStoreHook = <T extends object>(storeHook: () => T) => {
    return () => {
        const store = storeHook();

        // For compatibility with existing Context API code
        return {
            ...store,
            // Add compatibility methods if needed
            dispatch: (store as any).setCurrentEstimate, // example
            state: store,
        };
    };
};

// Migration logging for development
export const migrationLogger = (componentName: string, from: string, to: string) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 [Migration] ${componentName}: ${from} → ${to}`);
    }
};

// Validate migration success
export const validateMigration = (store: any, requiredMethods: string[]): boolean => {
    const missingMethods = requiredMethods.filter((method: any) => !(method in store));

    if (missingMethods.length > 0) {
        console.warn(`⚠️ Missing methods after migration:`, missingMethods);
        return false;
    }

    return true;
};

// Feature flag system for gradual rollout
export const isFeatureEnabled = (featureName: string): boolean => {
    const features = {
        zustand: true,
        reactQuery: true,
        typescript: true,
        // Add more features as they're completed
    };

    return features[featureName as keyof typeof features] ?? false;
};

// Log migration statistics
export const logMigrationStats = () => {
    if (process.env.NODE_ENV === 'development') {
        const stats = {
            zustandStores: ['estimate-store'],
            migratedContexts: ['EstimateContext'],
            pendingMigration: ['CatalogContext', 'EquipmentCatalogContext'],
        };

        console.group('📊 Migration Statistics');
        console.log('✅ Migrated:', stats.migratedContexts);
        console.log('🟡 Pending:', stats.pendingMigration);
        console.log('📦 New Stores:', stats.zustandStores);
        console.groupEnd();
    }
};
