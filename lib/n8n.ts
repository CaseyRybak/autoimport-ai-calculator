import type { CalculationBreakdown, CalculationInput } from "@/lib/calculate";
import { formatLeadDisplayNumber } from "@/lib/leads";
import { buildAdminLeadUrl } from "@/lib/telegram";

export type N8nLeadPayload = {
  id: string | null;
  leadNumber?: number | null;
  customerName: string;
  phone: string;
  telegram?: string | null;
  calculationInput: CalculationInput;
  calculationBreakdown: CalculationBreakdown;
};

export type N8nWebhookResult =
  | {
      ok: true;
      skipped: false;
    }
  | {
      ok: true;
      skipped: true;
      reason: "env_not_configured" | "missing_lead_id";
    }
  | {
      ok: false;
      error: string;
    };

const cleanEnv = (value: string | undefined) => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
};

export const buildN8nLeadWebhookPayload = (lead: N8nLeadPayload) => {
  const input = lead.calculationInput;
  const breakdown = lead.calculationBreakdown;
  const leadNumber = lead.leadNumber ?? null;

  return {
    event: "lead.created",
    lead_id: lead.id,
    lead_number: leadNumber ? formatLeadDisplayNumber(leadNumber) : null,
    lead_number_raw: leadNumber,
    customer: {
      name: lead.customerName,
      phone: lead.phone,
      telegram: lead.telegram ?? null,
    },
    vehicle: {
      country: input.country,
      brand: input.brand,
      model: input.model,
      year: input.year,
      engine_type: input.engineType,
      engine_volume_liters: input.engineVolumeLiters,
      destination_city: input.destinationCity,
      summary: `${input.brand} ${input.model} ${input.year}`.trim(),
    },
    budget: {
      budget_rub: input.budgetRub,
      total_rub: breakdown.totalRub,
      status: breakdown.budgetStatus,
      delta_rub: breakdown.budgetDeltaRub,
    },
    admin_lead_url: buildAdminLeadUrl(lead.id),
    created_at: new Date().toISOString(),
  };
};

export async function sendLeadCreatedN8nWebhook(lead: N8nLeadPayload): Promise<N8nWebhookResult> {
  const webhookUrl = cleanEnv(process.env.N8N_NEW_LEAD_WEBHOOK_URL);

  if (!webhookUrl) {
    return {
      ok: true,
      skipped: true,
      reason: "env_not_configured",
    };
  }

  if (!lead.id) {
    return {
      ok: true,
      skipped: true,
      reason: "missing_lead_id",
    };
  }

  const sharedSecret = cleanEnv(process.env.N8N_SHARED_SECRET);
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (sharedSecret) {
    headers["x-n8n-shared-secret"] = sharedSecret;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(5_000),
      body: JSON.stringify(buildN8nLeadWebhookPayload(lead)),
    });

    if (!response.ok) {
      console.error(`n8n lead webhook failed with status ${response.status}`);

      return {
        ok: false,
        error: `n8n webhook returned ${response.status}`,
      };
    }

    return {
      ok: true,
      skipped: false,
    };
  } catch {
    console.error("n8n lead webhook failed");

    return {
      ok: false,
      error: "n8n webhook request failed",
    };
  }
}
