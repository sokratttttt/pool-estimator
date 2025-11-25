require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    try {
        console.log('Reading catalog.json...');
        const catalogPath = path.join(__dirname, '../public/data/catalog.json');
        const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
        const items = catalogData.items;

        console.log(`Found ${items.length} items to migrate.`);

        // Process in batches of 100
        const BATCH_SIZE = 100;
        let processed = 0;
        let errors = 0;

        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batch = items.slice(i, i + BATCH_SIZE).map(item => ({
                id: `cat_${item.id}`, // Generate unique string ID
                name: item.name,
                category: item.category || 'uncategorized',
                subcategory: item.subcategory || null,
                price: item.price,
                unit: item.unit || 'шт',
                article: item.article || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                instock: true
            }));

            const { error } = await supabase
                .from('products')
                .upsert(batch, { onConflict: 'id' });

            if (error) {
                console.error(`Error migrating batch ${i / BATCH_SIZE + 1}:`, error.message);
                errors += batch.length;
            } else {
                processed += batch.length;
                process.stdout.write(`\rProcessed: ${processed}/${items.length}`);
            }
        }

        console.log('\nMigration complete!');
        console.log(`Successfully migrated: ${processed}`);
        console.log(`Errors: ${errors}`);

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
