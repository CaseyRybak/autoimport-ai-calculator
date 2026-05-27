"use server";

import { redirect } from "next/navigation";
import { grantAdminAccess, verifyAdminPassword } from "@/lib/admin-access";

function getSafeReturnTo(value: FormDataEntryValue | null) {
  const returnTo = typeof value === "string" ? value : "/admin";

  return returnTo.startsWith("/admin") ? returnTo : "/admin";
}

export async function submitAdminPassword(formData: FormData) {
  const password = formData.get("password");
  const returnTo = getSafeReturnTo(formData.get("returnTo"));

  if (typeof password !== "string" || !verifyAdminPassword(password)) {
    redirect(`/admin?error=1&returnTo=${encodeURIComponent(returnTo)}`);
  }

  await grantAdminAccess();
  redirect(returnTo);
}
