// Script to update bowl dimensions in Supabase
// Run with: node update-bowl-dimensions.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Bowl dimensions data from catalogs
const bowlDimensions = {
    // IQPools
    'РОНДО': { length: 3.5, width: 3.5, depth: '1.70', manufacturer: 'iqpools', volume: 15 },
    'КЛАССИКА': { length: 5.00, width: 3.00, depth: '1.65', manufacturer: 'iqpools', volume: 20 },
    'ЛЕГАТО': { length: 5.20, width: 2.80, depth: '1.40', manufacturer: 'iqpools', volume: 15 },
    'ГАММА': { length: 6.00, width: 3.00, depth: '1.65', manufacturer: 'iqpools', volume: 20 },
    'ТЕМП': { length: 6.10, width: 3.20, depth: '1.25-1.6', manufacturer: 'iqpools', volume: 24 },
    'ЛИМАН': { length: 6.40, width: 3.20, depth: '1.20-3.60', manufacturer: 'iqpools', volume: 22 },
    'ТЕРЦИЯ': { length: 6.55, width: 3.25, depth: '1.55', manufacturer: 'iqpools', volume: 25 },
    'ФОРТЕ': { length: 7.00, width: 3.00, depth: '1.65', manufacturer: 'iqpools', volume: 26 },
    'КВАРТЕТ': { length: 7.30, width: 3.20, depth: '1.25-1.60', manufacturer: 'iqpools', volume: 28 },
    'РЕЛАКС': { length: 7.50, width: 3.50, depth: '1.00-1.62', manufacturer: 'iqpools', volume: 30 },
    'ВИВО': { length: 8.00, width: 3.40, depth: '1.30-1.80', manufacturer: 'iqpools', volume: 32 },
    'РОЙАЛ': { length: 8.00, width: 3.50, depth: '1.00-1.65', manufacturer: 'iqpools', volume: 33 },
    'АЛЛЕГРО': { length: 8.80, width: 4.00, depth: '1.01-1.65', manufacturer: 'iqpools', volume: 38 },
    'МАРШ': { length: 9.00, width: 3.50, depth: '1.01-1.80', manufacturer: 'iqpools', volume: 40 },
    'ОКЕАНИК': { length: 10.70, width: 4.00, depth: '1.00-1.65', manufacturer: 'iqpools', volume: 40 },
    'КАСПИЙ': { length: 10.00, width: 4.00, depth: '1.57', manufacturer: 'iqpools', volume: 45 },
    'ХЬЮГО': { length: 3.0, width: 3.0, depth: '1.2', manufacturer: 'iqpools', volume: 1.94 },
    'РИМ': { length: 3.0, width: 3.0, depth: '1.2', manufacturer: 'iqpools', volume: 1.94 },
    'ДАЙМОНД': { length: 2.15, width: 2.15, depth: '1.65', manufacturer: 'iqpools', volume: 5 },
    'КВАДРО': { length: 2.80, width: 2.30, depth: '1.80', manufacturer: 'iqpools', volume: 9 },
    'СКАНДИ': { length: 2.15, width: 2.15, depth: '1.65', manufacturer: 'iqpools', volume: 6 },

    // San Juan
    'LUXOR 6536': { length: 6.5, width: 3.6, depth: '1.1-1.7', manufacturer: 'sanjuan' },
    'LUXOR 7537': { length: 7.5, width: 3.7, depth: '1.1-1.7', manufacturer: 'sanjuan' },
    'LUXOR 8537': { length: 8.5, width: 3.7, depth: '1.1-1.7', manufacturer: 'sanjuan' },
    'LUXOR 9537': { length: 9.5, width: 3.7, depth: '1.1-1.7', manufacturer: 'sanjuan' },
    'LUXOR 10537': { length: 10.5, width: 3.7, depth: '1.1-1.7', manufacturer: 'sanjuan' },
    'MARATHON 10037': { length: 10.0, width: 3.7, depth: '1.2-1.7', manufacturer: 'sanjuan' },
    'MARATHON 12037': { length: 12.0, width: 3.7, depth: '1.2-1.7', manufacturer: 'sanjuan' },
    'IPOOL 12037': { length: 12.0, width: 3.7, depth: '1.2-1.7', manufacturer: 'sanjuan' },
    'CLASSIC 8537': { length: 8.5, width: 3.7, depth: '1.1-1.7', manufacturer: 'sanjuan' },
    'RIO 7737': { length: 7.7, width: 3.7, depth: '1.1-1.75', manufacturer: 'sanjuan' },
    'RIO 8737': { length: 8.7, width: 3.7, depth: '1.2-1.8', manufacturer: 'sanjuan' },
    'RIO 9737': { length: 9.7, width: 3.7, depth: '1.2-1.8', manufacturer: 'sanjuan' },
    'MINIPOOL 4025': { length: 4.0, width: 2.5, depth: '1.5-1.3', manufacturer: 'sanjuan' },
    'MINIPOOL 4530': { length: 4.5, width: 3.0, depth: '1.5', manufacturer: 'sanjuan' },
    'MINIPOOL 5530': { length: 5.5, width: 3.0, depth: '1.5', manufacturer: 'sanjuan' },
    'MINIPOOL 6330': { length: 6.3, width: 3.0, depth: '1.5', manufacturer: 'sanjuan' },
    'QUICK 5025': { length: 5.0, width: 2.5, depth: '1.5', manufacturer: 'sanjuan' },
    'QUICK 6025': { length: 6.0, width: 2.5, depth: '1.6', manufacturer: 'sanjuan' },
    'QUICK 7025': { length: 7.0, width: 2.5, depth: '1.6', manufacturer: 'sanjuan' },
    'SPA 5030': { length: 5.0, width: 3.0, depth: '1', manufacturer: 'sanjuan' },
    'SPA 2525': { length: 4.5, width: 2.5, depth: '1', manufacturer: 'sanjuan' },
    'SPA 4025': { length: 4.0, width: 2.5, depth: '1', manufacturer: 'sanjuan' },
    'SPA 2424': { length: 2.4, width: 2.4, depth: '0.9', manufacturer: 'sanjuan' },
    'SPLASH 1818': { length: 1.8, width: 1.8, depth: '1.2', manufacturer: 'sanjuan' },
    'SPLASH 1922': { length: 1.9, width: 2.2, depth: '1.5', manufacturer: 'sanjuan' },
    'SPLASH 3418': { length: 3.4, width: 1.8, depth: '1.5', manufacturer: 'sanjuan' },
    'SPLASH 3020': { length: 3.0, width: 2.0, depth: '1.5', manufacturer: 'sanjuan' },
    'SUPERMINI 2515': { length: 2.5, width: 1.5, depth: '0.7', manufacturer: 'sanjuan' },
    'TECH ROOM 1824': { length: 2.4, width: 1.8, depth: '1.7', manufacturer: 'sanjuan' },
};

async function updateBowlDimensions() {
    console.log('Starting bowl dimensions update...\n');

    // First, check if columns exist
    const { data: existingProducts, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'bowls')
        .limit(1);

    if (fetchError) {
        console.error('Error fetching products:', fetchError);
        return;
    }

    // Check if we need to add columns
    const sampleProduct = existingProducts?.[0];
    const needsColumns = sampleProduct && !('length' in sampleProduct);

    if (needsColumns) {
        console.log('⚠️  Warning: length, width, depth columns do not exist in products table.');
        console.log('You may need to add them manually in Supabase Dashboard:\n');
        console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS length DECIMAL;');
        console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS width DECIMAL;');
        console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS depth TEXT;');
        console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer TEXT;');
        console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS volume DECIMAL;\n');
    }

    // Get all bowl products
    const { data: bowls, error: bowlsError } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'bowls');

    if (bowlsError) {
        console.error('Error fetching bowls:', bowlsError);
        return;
    }

    console.log(`Found ${bowls.length} bowls in database\n`);

    let updated = 0;
    let notFound = 0;

    for (const bowl of bowls) {
        // Try to find dimensions by exact name match or partial match
        const bowlName = bowl.name.toUpperCase().trim();
        let dimensionData = null;

        // Try exact match first
        for (const [key, value] of Object.entries(bowlDimensions)) {
            if (bowlName.includes(key.toUpperCase())) {
                dimensionData = value;
                break;
            }
        }

        if (dimensionData) {
            const updateData = {
                length: dimensionData.length,
                width: dimensionData.width,
                depth: dimensionData.depth,
                manufacturer: dimensionData.manufacturer,
            };

            if (dimensionData.volume) {
                updateData.volume = dimensionData.volume;
            }

            const { error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', bowl.id);

            if (error) {
                console.error(`❌ Error updating ${bowl.name}:`, error.message);
            } else {
                console.log(`✅ Updated ${bowl.name}: ${dimensionData.length}м × ${dimensionData.width}м × ${dimensionData.depth}м (${dimensionData.manufacturer})`);
                updated++;
            }
        } else {
            console.log(`⚠️  No dimensions found for: ${bowl.name}`);
            notFound++;
        }
    }

    console.log(`\n✨ Update complete!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Not found: ${notFound}`);
}

updateBowlDimensions().catch(console.error);
