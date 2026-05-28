"use server";

import { revalidatePath } from "next/cache";
import { hasAdminAccess, isAdminPasswordConfigured } from "@/lib/admin-access";
import {
  addLeadComment,
  leadStatusLabels,
  leadStatuses,
  updateLeadStatus,
  type LeadManagerComment,
  type LeadStatus,
} from "@/lib/leads";

export type LeadCrmActionState = {
  ok: boolean | null;
  message: string | null;
  status: LeadStatus | null;
  comment: LeadManagerComment | null;
};

async function requireLeadManagementAccess() {
  if (!isAdminPasswordConfigured()) {
    return "Управление заявкой недоступно: не настроен доступ администратора.";
  }

  if (!(await hasAdminAccess())) {
    return "Перед управлением заявкой необходимо войти в админку.";
  }

  return null;
}

const actionFailure = (message: string): LeadCrmActionState => ({
  ok: false,
  message,
  status: null,
  comment: null,
});

export async function updateLeadStatusAction(
  _state: LeadCrmActionState,
  formData: FormData,
): Promise<LeadCrmActionState> {
  const accessError = await requireLeadManagementAccess();

  if (accessError) {
    return actionFailure(accessError);
  }

  const leadId = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!leadStatuses.includes(status as LeadStatus)) {
    return actionFailure("Недопустимый статус заявки.");
  }

  const nextStatus = status as LeadStatus;
  const updateResult = await updateLeadStatus(leadId, nextStatus);

  if (!updateResult.ok) {
    return actionFailure(updateResult.error);
  }

  const commentResult = await addLeadComment(
    leadId,
    `Статус заявки изменен: ${leadStatusLabels[nextStatus]}`,
  );

  revalidatePath("/admin");

  if (!commentResult.ok) {
    return {
      ok: true,
      message: "Статус заявки изменен, но запись в историю не сохранена.",
      status: nextStatus,
      comment: null,
    };
  }

  return {
    ok: true,
    message: "Статус заявки изменен",
    status: nextStatus,
    comment: commentResult.comment ?? null,
  };
}

export async function addLeadCommentAction(
  _state: LeadCrmActionState,
  formData: FormData,
): Promise<LeadCrmActionState> {
  const accessError = await requireLeadManagementAccess();

  if (accessError) {
    return actionFailure(accessError);
  }

  const leadId = String(formData.get("leadId") ?? "");
  const comment = String(formData.get("comment") ?? "");

  if (!comment.trim()) {
    return actionFailure("Комментарий не должен быть пустым.");
  }

  const result = await addLeadComment(leadId, comment);

  if (!result.ok) {
    return actionFailure(result.error);
  }

  return {
    ok: true,
    message: "Комментарий сохранен",
    status: null,
    comment: result.comment ?? null,
  };
}
