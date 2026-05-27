import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "autoimport_admin_access";
const cookieMaxAgeSeconds = 60 * 60 * 12;

function getAdminPassword() {
  return process.env.ADMIN_DEMO_PASSWORD?.trim() ?? "";
}

export function isAdminPasswordConfigured() {
  return Boolean(getAdminPassword());
}

function sign(value: string) {
  return createHmac("sha256", getAdminPassword()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function createCookieValue() {
  const issuedAt = Date.now().toString();

  return `${issuedAt}.${sign(issuedAt)}`;
}

function isValidCookieValue(value: string | undefined) {
  if (!value || !isAdminPasswordConfigured()) {
    return false;
  }

  const [issuedAt, signature] = value.split(".");
  const issuedAtNumber = Number(issuedAt);

  if (!issuedAt || !signature || !Number.isFinite(issuedAtNumber)) {
    return false;
  }

  const ageMs = Date.now() - issuedAtNumber;

  if (ageMs < 0 || ageMs > cookieMaxAgeSeconds * 1000) {
    return false;
  }

  return safeEqual(signature, sign(issuedAt));
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword();

  if (!expected) {
    return false;
  }

  return safeEqual(password, expected);
}

export async function hasAdminAccess() {
  const cookieStore = await cookies();

  return isValidCookieValue(cookieStore.get(cookieName)?.value);
}

export async function grantAdminAccess() {
  const cookieStore = await cookies();

  cookieStore.set(cookieName, createCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: cookieMaxAgeSeconds,
  });
}
