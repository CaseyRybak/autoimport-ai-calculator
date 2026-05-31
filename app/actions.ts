"use server";

import type { CalculationBreakdown, CalculationInput } from "@/lib/calculate";
import { createLead } from "@/lib/leads";
import { sendLeadCreatedNotification } from "@/lib/telegram";

export type SubmitLeadState =
  | {
      ok: true;
      mode: "supabase" | "demo";
      id: string | null;
    }
  | {
      ok: false;
      error: string;
    };

export async function submitLeadAction(payload: {
  customerName: string;
  phone: string;
  telegram?: string;
  comment?: string;
  calculationInput: CalculationInput;
  calculationBreakdown: CalculationBreakdown;
}): Promise<SubmitLeadState> {
  const result = await createLead(payload);

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
    };
  }

  if (result.mode === "supabase") {
    await sendLeadCreatedNotification({
      id: result.lead?.id ?? result.id,
      leadNumber: result.lead?.leadNumber ?? null,
      customerName: result.lead?.customerName ?? payload.customerName,
      phone: result.lead?.phone ?? payload.phone,
      telegram: result.lead?.telegram ?? payload.telegram,
      calculationInput: result.lead?.calculationInput ?? payload.calculationInput,
      calculationBreakdown: result.lead?.calculationBreakdown ?? payload.calculationBreakdown,
    });
  }

  return {
    ok: true,
    mode: result.mode,
    id: result.id,
  };
}
