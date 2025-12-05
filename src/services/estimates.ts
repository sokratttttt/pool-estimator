import { Estimate } from "@/types/estimate";

const BASE_URL = "/api/estimates";

export async function getEstimates(): Promise<Estimate[]> {
    try {
        const res = await fetch(BASE_URL);
        if (!res.ok) throw new Error("Failed to fetch estimates");

        const clients = await res.json();
        const allEstimates: Estimate[] = [];
        clients.forEach((client: any) => {
            (client.estimates || []).forEach((estimate: Estimate) => {
                allEstimates.push({ ...estimate, clientId: client.id, customer: client });
            });
        });
        return allEstimates;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function updateEstimate(estimateId: string, data: Partial<Estimate> & { customer?: any }): Promise<Estimate> {
    const res = await fetch(BASE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            clientId: data.customer?.id,
            estimateId,
            updates: data
        })
    });
    if (!res.ok) throw new Error("Failed to update estimate");
    return res.json();
}

export async function deleteEstimate(estimateId: string, clientId?: string): Promise<void> {
    try {
        // Получаем все сметы, чтобы найти clientId
        const estimates = await getEstimates();
        const estimate = estimates.find(e => e.id === estimateId);

        if (!estimate) {
            throw new Error("Estimate not found");
        }

        const targetClientId = clientId || (estimate as any).clientId;

        if (!targetClientId) {
            throw new Error("clientId is required to delete estimate");
        }

        const url = new URL(BASE_URL, location.origin);
        url.searchParams.set("clientId", targetClientId);
        url.searchParams.set("estimateId", estimateId);

        const res = await fetch(url.toString(), { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete estimate");
    } catch (error) {
        console.error("Error deleting estimate:", error);
        throw error;
    }
}