import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/clients.json');

interface Client {
    id: string;
    createdAt: string;
    updatedAt?: string;
    estimates?: unknown[];
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    [key: string]: unknown;
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

// GET - Get all clients or a specific client
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const data = await readClients();

        if (id) {
            const client = data.clients.find(c => c.id === id);
            if (!client) {
                return NextResponse.json({ error: 'Client not found' }, { status: 404 });
            }
            return NextResponse.json(client);
        }

        return NextResponse.json(data.clients);
    } catch (error) {
        console.error('Error reading clients:', error);
        return NextResponse.json({ error: 'Failed to read clients' }, { status: 500 });
    }
}

// POST - Create a new client
export async function POST(request: NextRequest) {
    try {
        const clientData = await request.json();
        const data = await readClients();

        const newClient: Client = {
            id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...clientData,
            createdAt: new Date().toISOString(),
            estimates: []
        };

        data.clients.push(newClient);
        await writeClients(data);

        return NextResponse.json(newClient, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }
}

// PUT - Update a client
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const updates = await request.json();

        const data = await readClients();
        const clientIndex = data.clients.findIndex(c => c.id === id);

        if (clientIndex === -1) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        data.clients[clientIndex] = {
            ...data.clients[clientIndex],
            ...updates,
            id: id!, // Preserve ID
            createdAt: data.clients[clientIndex].createdAt, // Preserve creation date
            updatedAt: new Date().toISOString()
        };

        await writeClients(data);
        return NextResponse.json(data.clients[clientIndex]);
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }
}

// DELETE - Delete a client
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const data = await readClients();
        const clientIndex = data.clients.findIndex(c => c.id === id);

        if (clientIndex === -1) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        data.clients.splice(clientIndex, 1);
        await writeClients(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }
}
