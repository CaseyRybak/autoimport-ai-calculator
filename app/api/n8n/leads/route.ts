import { NextResponse, type NextRequest } from "next/server";
import {
  addLeadComment,
  getLeadAutomationStatus,
  getLeadStatusCounts,
  leadStatusLabels,
  leadStatuses,
  updateLeadStatus,
  type LeadStatus,
} from "@/lib/leads";

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

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const body = payload && typeof payload === "object" ? payload : {};
  const leadId = "leadId" in body ? String(body.leadId ?? "").trim() : "";
  const status = "status" in body ? String(body.status ?? "").trim() : "";
  const actor = "actor" in body ? String(body.actor ?? "").trim() : "";

  if (!leadId) {
    return NextResponse.json({ ok: false, error: "leadId is required" }, { status: 400 });
  }

  if (!leadStatuses.includes(status as LeadStatus)) {
    return NextResponse.json({ ok: false, error: "Unsupported lead status" }, { status: 400 });
  }

  const existingLead = await getLeadAutomationStatus(leadId);

  if (!existingLead) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  const nextStatus = status as LeadStatus;
  const updateResult = await updateLeadStatus(leadId, nextStatus);

  if (!updateResult.ok) {
    return NextResponse.json({ ok: false, error: updateResult.error }, { status: 503 });
  }

  const commentResult = await addLeadComment(
    leadId,
    [
      `Статус заявки изменен из Telegram: ${leadStatusLabels[nextStatus]}`,
      actor ? `Исполнитель: ${actor}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  );

  const lead = await getLeadAutomationStatus(leadId);

  return NextResponse.json({
    ok: true,
    status: nextStatus,
    label: leadStatusLabels[nextStatus],
    lead,
    commentSaved: commentResult.ok,
  });
}
