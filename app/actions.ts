"use server";

import type { CalculationBreakdown, CalculationInput } from "@/lib/calculate";
import { createLead } from "@/lib/leads";

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

  return {
    ok: true,
    mode: result.mode,
    id: result.id,
  };
}
