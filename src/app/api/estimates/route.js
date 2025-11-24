import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/clients.json');

// Helper to read clients
async function readClients() {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { clients: [] };
    }
}

// Helper to write clients
async function writeClients(data) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// POST - Save estimate for a client
export async function POST(request) {
    try {
        const { clientId, estimate } = await request.json();
        const data = await readClients();

        const clientIndex = data.clients.findIndex(c => c.id === clientId);
        if (clientIndex === -1) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const newEstimate = {
            id: `estimate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...estimate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!data.clients[clientIndex].estimates) {
            data.clients[clientIndex].estimates = [];
        }

        data.clients[clientIndex].estimates.push(newEstimate);
        await writeClients(data);

        return NextResponse.json(newEstimate, { status: 201 });
    } catch (error) {
        console.error('Error saving estimate:', error);
        return NextResponse.json({ error: 'Failed to save estimate' }, { status: 500 });
    }
}

// PUT - Update an estimate
export async function PUT(request) {
    try {
        const { clientId, estimateId, updates } = await request.json();
        const data = await readClients();

        const clientIndex = data.clients.findIndex(c => c.id === clientId);
        if (clientIndex === -1) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const estimateIndex = data.clients[clientIndex].estimates.findIndex(e => e.id === estimateId);
        if (estimateIndex === -1) {
            return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
        }

        data.clients[clientIndex].estimates[estimateIndex] = {
            ...data.clients[clientIndex].estimates[estimateIndex],
            ...updates,
            id: estimateId, // Preserve ID
            createdAt: data.clients[clientIndex].estimates[estimateIndex].createdAt, // Preserve creation date
            updatedAt: new Date().toISOString()
        };

        await writeClients(data);
        return NextResponse.json(data.clients[clientIndex].estimates[estimateIndex]);
    } catch (error) {
        console.error('Error updating estimate:', error);
        return NextResponse.json({ error: 'Failed to update estimate' }, { status: 500 });
    }
}

// DELETE - Delete an estimate
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        const estimateId = searchParams.get('estimateId');

        const data = await readClients();
        const clientIndex = data.clients.findIndex(c => c.id === clientId);

        if (clientIndex === -1) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const estimateIndex = data.clients[clientIndex].estimates.findIndex(e => e.id === estimateId);
        if (estimateIndex === -1) {
            return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
        }

        data.clients[clientIndex].estimates.splice(estimateIndex, 1);
        await writeClients(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting estimate:', error);
        return NextResponse.json({ error: 'Failed to delete estimate' }, { status: 500 });
    }
}
