import { NextResponse } from "next/server";
import { hasAdminAccess, isAdminPasswordConfigured } from "@/lib/admin-access";
import { getLeadById, listLeadComments } from "@/lib/leads";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  if (!isAdminPasswordConfigured() || !(await hasAdminAccess())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  const comments = await listLeadComments(id);

  return NextResponse.json({
    ok: true,
    lead: {
      id: lead.id,
      status: lead.status,
      updatedAt: lead.updatedAt,
    },
    comments,
  });
}
