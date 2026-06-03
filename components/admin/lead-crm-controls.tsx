"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  addLeadCommentAction,
  updateLeadStatusAction,
  type LeadCrmActionState,
} from "@/app/admin/leads/[id]/actions";
import { Button } from "@/components/ui/button";
import type { LeadManagerComment, LeadStatus } from "@/lib/leads";

type StatusOption = {
  value: LeadStatus;
  label: string;
};

type Props = {
  leadId: string;
  status: LeadStatus;
  comments: LeadManagerComment[];
  statusOptions: StatusOption[];
  statusLabels: Record<LeadStatus, string>;
  statusClasses: Record<LeadStatus, string>;
  isManagementEnabled: boolean;
};

const formatCommentDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const initialLeadCrmActionState: LeadCrmActionState = {
  ok: null,
  message: null,
  status: null,
  comment: null,
};

type LeadCrmSnapshot = {
  ok: boolean;
  lead?: {
    id: string;
    status: LeadStatus;
    updatedAt: string;
  };
  comments?: LeadManagerComment[];
};

export function LeadCrmPanel({
  leadId,
  status,
  comments,
  statusOptions,
  statusLabels,
  statusClasses,
  isManagementEnabled,
}: Props) {
  const statusFormRef = useRef<HTMLFormElement>(null);
  const commentFormRef = useRef<HTMLFormElement>(null);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentComments, setCurrentComments] = useState(comments);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [statusState, statusAction, isStatusPending] = useActionState(
    updateLeadStatusAction,
    initialLeadCrmActionState,
  );
  const [commentState, commentAction, isCommentPending] = useActionState(
    addLeadCommentAction,
    initialLeadCrmActionState,
  );

  useEffect(() => {
    if (!statusState.message) {
      return;
    }

    if (statusState.ok && statusState.status) {
      setCurrentStatus(statusState.status);
    }

    if (statusState.ok && statusState.comment) {
      setCurrentComments((items) => [statusState.comment as LeadManagerComment, ...items]);
    }

    setNotice({
      ok: statusState.ok === true,
      message: statusState.message,
    });
  }, [statusState]);

  useEffect(() => {
    setCurrentStatus(status);
    setCurrentComments(comments);
  }, [comments, status]);

  useEffect(() => {
    if (!isManagementEnabled) {
      return;
    }

    let isMounted = true;
    let activeRequest: AbortController | null = null;

    const refreshSnapshot = async () => {
      activeRequest?.abort();
      activeRequest = new AbortController();

      try {
        const response = await fetch(
          `/admin/leads/${encodeURIComponent(leadId)}/snapshot`,
          {
            cache: "no-store",
            credentials: "same-origin",
            signal: activeRequest.signal,
          },
        );

        if (!response.ok || !isMounted) {
          return;
        }

        const snapshot = (await response.json()) as LeadCrmSnapshot;

        if (!snapshot.ok || !snapshot.lead || !(snapshot.lead.status in statusLabels)) {
          return;
        }

        setCurrentStatus(snapshot.lead.status);

        if (snapshot.comments) {
          setCurrentComments(snapshot.comments);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    };

    refreshSnapshot();

    const interval = window.setInterval(refreshSnapshot, 5000);

    return () => {
      isMounted = false;
      activeRequest?.abort();
      window.clearInterval(interval);
    };
  }, [isManagementEnabled, leadId, statusLabels]);

  useEffect(() => {
    if (!commentState.message) {
      return;
    }

    if (commentState.ok && commentState.comment) {
      setCurrentComments((items) => [commentState.comment as LeadManagerComment, ...items]);
      commentFormRef.current?.reset();
    }

    setNotice({
      ok: commentState.ok === true,
      message: commentState.message,
    });
  }, [commentState]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 3000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <>
      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-semibold">Статус</h2>
        <span
          className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusClasses[currentStatus]}`}
        >
          {statusLabels[currentStatus]}
        </span>
        <form ref={statusFormRef} action={statusAction}>
          <input type="hidden" name="leadId" value={leadId} />
          <select
            className="form-field mt-4"
            name="status"
            value={currentStatus}
            disabled={!isManagementEnabled || isStatusPending}
            onChange={(event) => {
              setCurrentStatus(event.target.value as LeadStatus);
              window.setTimeout(() => statusFormRef.current?.requestSubmit(), 0);
            }}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </form>
        {notice ? (
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm ${
              notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
            }`}
          >
            {notice.message}
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-semibold">Комментарий менеджера</h2>
        <form ref={commentFormRef} action={commentAction} className="mt-3 space-y-3">
          <input type="hidden" name="leadId" value={leadId} />
          <textarea
            className="form-field min-h-32"
            name="comment"
            placeholder="Внутренний комментарий"
            disabled={!isManagementEnabled || isCommentPending}
          />
          <Button type="submit" className="w-full" disabled={!isManagementEnabled || isCommentPending}>
            Добавить комментарий
          </Button>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-semibold">История комментариев</h2>
        {currentComments.length > 0 ? (
          <div className="mt-4 space-y-3">
            {currentComments.map((comment) => (
              <article key={comment.id} className="rounded-md border bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{comment.authorName}</span>
                  <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{comment.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Комментариев пока нет.</p>
        )}
      </section>
    </>
  );
}
