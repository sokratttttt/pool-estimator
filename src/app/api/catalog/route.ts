import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client for server-side operations
const getSupabase = () => {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase credentials not configured');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
};

export async function GET() {
    try {
        const supabase = getSupabase();

        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group products by category
        const grouped = {
            bowls: [],
            heating: [],
            filtration: [],
            parts: [],
            additional: []
        };

        products.forEach(product => {
            if (grouped[product.category]) {
                grouped[product.category].push(product);
            }
        });

        return NextResponse.json(grouped);
    } catch (error) {
        console.error('Error reading catalog:', error);
        return NextResponse.json({ error: (error as any).message || 'Failed to read catalog data' }, { status: 500 });
    }
}

export async function POST(request: any) {
    try {
        const body = await request.json();
        const supabase = getSupabase();

        // Validate required fields
        if (!body.item || !body.type) {
            return NextResponse.json({ error: 'Missing item or type' }, { status: 400 });
        }

        const product = {
            id: body.item.id || `${body.type}_${Date.now()}`,
            name: body.item.name,
            category: body.type,
            price: body.item.price,
            unit: body.item.unit || 'шт',
            image: body.item.image || null,
            description: body.item.description || null,
            specifications: body.item.specifications || null,
        };

        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: (error as any).message || 'Failed to create product' }, { status: 500 });
    }
}

export async function DELETE(request: any) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const supabase = getSupabase();

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: (error as any).message || 'Failed to delete product' }, { status: 500 });
    }
}

export async function PUT(request: any) {
    try {
        const body = await request.json();
        const { id, updates } = body;

        if (!id || !updates) {
            return NextResponse.json({ error: 'Missing id or updates' }, { status: 400 });
        }

        // Check if image is too large (max 2MB base64)
        if (updates.image) {
            const sizeInMB = (updates.image.length * 0.75) / (1024 * 1024);
            if (process.env.NODE_ENV === 'development') {
                console.log(`Image size: ${sizeInMB.toFixed(2)} MB`);
            }

            if (sizeInMB > 2) {
                return NextResponse.json({
                    error: `Изображение слишком большое: ${sizeInMB.toFixed(2)} MB. Максимум 2MB.`
                }, { status: 400 });
            }
        }

        const supabase = getSupabase();

        const updateData = {
            ...updates,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;

        // Return first item from array
        const updatedProduct = data && data.length > 0 ? data[0] : null;

        if (!updatedProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({
            error: (error as any).message || 'Failed to update product'
        }, { status: 500 });
    }
}
