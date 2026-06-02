import { NextResponse, type NextRequest } from "next/server";
import { getLeadAutomationStatus, getLeadStatusCounts } from "@/lib/leads";

const getSharedSecret = () => {
  const trimmed = process.env.N8N_SHARED_SECRET?.trim();

  return trimmed ? trimmed : null;
};

const isAuthorized = (request: NextRequest) => {
  const sharedSecret = getSharedSecret();

  if (!sharedSecret) {
    return false;
  }

  return request.headers.get("x-n8n-shared-secret") === sharedSecret;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const leadId = request.nextUrl.searchParams.get("leadId")?.trim();

  if (leadId) {
    const lead = await getLeadAutomationStatus(leadId);

    if (!lead) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead });
  }

  const counts = await getLeadStatusCounts();

  if (!counts) {
    return NextResponse.json(
      { ok: false, error: "Lead status counts unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, counts });
}
