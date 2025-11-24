import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Compress and convert image to base64
async function compressImage(filePath) {
    try {
        const buffer = await sharp(filePath)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

        const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        const sizeKB = (base64.length * 0.75) / 1024;

        console.log(`   📐 Compressed to ${sizeKB.toFixed(2)} KB`);

        if (sizeKB > 2000) {
            console.log('   ⚠️  Still too large, reducing quality...');
            const smallerBuffer = await sharp(filePath)
                .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 60 })
                .toBuffer();
            return `data:image/jpeg;base64,${smallerBuffer.toString('base64')}`;
        }

        return base64;
    } catch (error) {
        console.error(`   ❌ Error compressing ${filePath}:`, error.message);
        return null;
    }
}

// Extract product name from filename
function extractProductName(filename) {
    // Remove extension and normalize
    return filename
        .replace(/\.(png|jpg|jpeg)$/i, '')
        .trim();
}

async function updateProductImages() {
    console.log('🖼️  Starting image update process...\n');

    const directories = [
        { path: './ChashiPhoto/SanJuan', brand: 'San Juan' },
        { path: './ChashiPhoto/IQPools', brand: 'IQPools' }
    ];

    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const dir of directories) {
        console.log(`\n📂 Processing ${dir.brand}...`);

        try {
            const files = readdirSync(dir.path).filter(f =>
                /\.(png|jpg|jpeg)$/i.test(f) && !f.startsWith('.')
            );

            console.log(`   Found ${files.length} image files\n`);

            for (const file of files) {
                const filePath = join(dir.path, file);
                const productName = extractProductName(file);

                console.log(`   Processing: ${productName}`);
                totalProcessed++;

                // Check file size
                const stats = statSync(filePath);
                const sizeMB = stats.size / (1024 * 1024);
                console.log(`   Original size: ${sizeMB.toFixed(2)} MB`);

                // Compress image
                const base64Image = await compressImage(filePath);

                if (!base64Image) {
                    totalErrors++;
                    continue;
                }

                // Find product in Supabase (case-insensitive search)
                const { data: products, error: searchError } = await supabase
                    .from('products')
                    .select('id, name')
                    .ilike('name', `%${productName}%`);

                if (searchError) {
                    console.error(`   ❌ Search error:`, searchError.message);
                    totalErrors++;
                    continue;
                }

                if (!products || products.length === 0) {
                    console.log(`   ⚠️  Product not found in database: "${productName}"`);
                    totalErrors++;
                    continue;
                }

                // If multiple matches, try exact match first
                let product = products.find(p =>
                    p.name.toLowerCase() === productName.toLowerCase()
                );

                if (!product) {
                    product = products[0];
                    console.log(`   ℹ️  Using closest match: "${product.name}"`);
                }

                // Update product with image
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ image: base64Image, updated_at: new Date().toISOString() })
                    .eq('id', product.id);

                if (updateError) {
                    console.error(`   ❌ Update error:`, updateError.message);
                    totalErrors++;
                } else {
                    console.log(`   ✅ Updated: ${product.name}\n`);
                    totalUpdated++;
                }
            }
        } catch (error) {
            console.error(`❌ Error processing ${dir.brand}:`, error.message);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Image update complete!');
    console.log(`   • Processed: ${totalProcessed} images`);
    console.log(`   • Updated: ${totalUpdated} products`);
    console.log(`   • Errors: ${totalErrors}`);
    console.log('='.repeat(50));
}

updateProductImages();
