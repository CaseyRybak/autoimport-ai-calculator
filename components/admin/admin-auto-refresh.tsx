"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  intervalMs?: number;
};

export function AdminAutoRefresh({ intervalMs = 5000 }: Props) {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, router]);

  return null;
}
