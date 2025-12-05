import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/clients.json');

interface Estimate {
    id: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

interface Client {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    website?: string;
    estimates?: Estimate[];
    [key: string]: any;
}

interface Data {
    clients: Client[];
}

// Helper to read clients
async function readClients(): Promise<Data> {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch {
        return { clients: [] };
    }
}

// Helper to write clients
async function writeClients(data: Data) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// GET - Get all estimates from all clients
export async function GET() {
    try {
        const data = await readClients();

        // Собираем все сметы со всех клиентов
        const allEstimates = data.clients.flatMap(client =>
            (client.estimates || []).map(estimate => ({
                ...estimate,
                clientId: client.id,
                customer: {
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    phone: client.phone,
                    company: client.company,
                    address: client.address,
                    website: client.website
                }
            }))
        );

        return NextResponse.json(allEstimates);
    } catch (error) {
        console.error('Error fetching estimates:', error);
        return NextResponse.json({ error: 'Failed to fetch estimates' }, { status: 500 });
    }
}

// POST - Save estimate for a client
export async function POST(request: NextRequest) {
    try {
        const { clientId, estimate } = await request.json();
        const data = await readClients();

        const clientIndex = data.clients.findIndex(c => c.id === clientId);
        if (clientIndex === -1) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const newEstimate: Estimate = {
            id: `estimate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...estimate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!data.clients[clientIndex].estimates) {
            data.clients[clientIndex].estimates = [];
        }

        data.clients[clientIndex].estimates!.push(newEstimate);
        await writeClients(data);

        return NextResponse.json(newEstimate, { status: 201 });
    } catch (error) {
        console.error('Error saving estimate:', error);
        return NextResponse.json({ error: 'Failed to save estimate' }, { status: 500 });
    }
}

// PUT - Update an estimate
export async function PUT(request: NextRequest) {
    try {
        const { clientId, estimateId, updates } = await request.json();
        const data = await readClients();

        const clientIndex = data.clients.findIndex(c => c.id === clientId);
        if (clientIndex === -1) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const estimates = data.clients[clientIndex].estimates || [];
        const estimateIndex = estimates.findIndex(e => e.id === estimateId);

        if (estimateIndex === -1) {
            return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
        }

        estimates[estimateIndex] = {
            ...estimates[estimateIndex],
            ...updates,
            id: estimateId, // Preserve ID
            createdAt: estimates[estimateIndex].createdAt, // Preserve creation date
            updatedAt: new Date().toISOString()
        };

        data.clients[clientIndex].estimates = estimates;

        await writeClients(data);
        return NextResponse.json(estimates[estimateIndex]);
    } catch (error) {
        console.error('Error updating estimate:', error);
        return NextResponse.json({ error: 'Failed to update estimate' }, { status: 500 });
    }
}

// DELETE - Delete an estimate
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        const estimateId = searchParams.get('estimateId');

        const data = await readClients();
        const clientIndex = data.clients.findIndex(c => c.id === clientId);

        if (clientIndex === -1) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const estimates = data.clients[clientIndex].estimates || [];
        const estimateIndex = estimates.findIndex(e => e.id === estimateId);

        if (estimateIndex === -1) {
            return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
        }

        estimates.splice(estimateIndex, 1);
        data.clients[clientIndex].estimates = estimates;

        await writeClients(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting estimate:', error);
        return NextResponse.json({ error: 'Failed to delete estimate' }, { status: 500 });
    }
}