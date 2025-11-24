import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in .env.local');
    console.error('Expected: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateCatalog() {
    try {
        console.log('📦 Starting catalog migration...\n');

        // Read catalog.json
        const catalogPath = './src/data/catalog.json';
        const catalogData = JSON.parse(readFileSync(catalogPath, 'utf8'));

        const categories = ['bowls', 'heating', 'filtration', 'parts', 'additional'];
        let totalMigrated = 0;
        let totalErrors = 0;

        for (const category of categories) {
            const items = catalogData[category] || [];

            if (items.length === 0) {
                console.log(`⏭️  Skipping ${category} (no items)`);
                continue;
            }

            console.log(`\n📂 Migrating ${category}...`);

            for (const item of items) {
                try {
                    const product = {
                        id: item.id || `${category}_${Date.now()}_${Math.random()}`,
                        name: item.name,
                        category: category,
                        price: parseFloat(item.price) || 0,
                        unit: item.unit || 'шт',
                        image: item.image || null,
                        description: item.description || null,
                        specifications: item.specifications || null,
                    };

                    const { error } = await supabase
                        .from('products')
                        .insert([product]);

                    if (error) {
                        console.error(`   ❌ Failed to migrate "${item.name}":`, error.message);
                        totalErrors++;
                    } else {
                        console.log(`   ✅ Migrated: ${item.name}`);
                        totalMigrated++;
                    }
                } catch (err) {
                    console.error(`   ❌ Error processing "${item.name}":`, err.message);
                    totalErrors++;
                }
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`✅ Migration complete!`);
        console.log(`   • Migrated: ${totalMigrated} products`);
        console.log(`   • Errors: ${totalErrors}`);
        console.log('='.repeat(50));

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateCatalog();
