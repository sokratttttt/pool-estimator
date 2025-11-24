// Pool estimation constants
export const POOL_CONSTANTS = {
    // Equipment ratios
    SKIMMER_RATIO: 25, // m³ per skimmer
    NOZZLE_RATIO: 7,   // m³ per nozzle

    // Construction dimensions
    CONCRETE_THICKNESS: 0.2,  // meters (20cm for walls/floor)
    BELT_WIDTH: 0.3,          // meters (30cm belt width)
    BELT_HEIGHT: 0.3,         // meters (30cm belt height)
    SLAB_THICKNESS: 0.2,      // meters (20cm slab thickness)

    // Material densities
    CONCRETE_DENSITY: 2400,   // kg/m³
    REBAR_PER_M3: 80,        // kg per m³ of concrete

    // Default values
    DEFAULT_DEPTH: 1.5,       // meters (for volume calculation)
    MIN_FILTRATION_CYCLES: 2, // pool volume cycles per day
};

// Category IDs for catalog
export const CATALOG_CATEGORIES = {
    BOWLS: 'bowls',
    FILTRATION: 'filtration',
    HEATING: 'heating',
    PARTS: 'parts',
    ADDITIONAL: 'additional',
};

// Construction types
export const CONSTRUCTION_TYPES = {
    MONOLITH: 'monolith',  // Concrete
    BELT: 'belt',          // Composite
    SLAB: 'slab',          // Polypropylene
};
