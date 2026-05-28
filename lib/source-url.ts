export function normalizeSourceUrl(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return {
      ok: true,
      value: null,
      error: null,
    } as const;
  }

  if (/\s/.test(trimmed)) {
    return {
      ok: false,
      value: null,
      error: "source_url must include a valid domain, for example aaa.com.",
    } as const;
  }

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;

  try {
    url = new URL(withProtocol);
  } catch {
    return {
      ok: false,
      value: null,
      error: "source_url must include a valid domain, for example aaa.com.",
    } as const;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      ok: false,
      value: null,
      error: "source_url must use http or https.",
    } as const;
  }

  const hostname = url.hostname.toLowerCase();
  const labels = hostname.split(".");
  const hasValidDomain =
    labels.length >= 2 &&
    labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) &&
    /^[a-z]{2,}$/.test(labels[labels.length - 1]);

  if (!hasValidDomain) {
    return {
      ok: false,
      value: null,
      error: "source_url must include a valid domain, for example aaa.com.",
    } as const;
  }

  return {
    ok: true,
    value: url.toString(),
    error: null,
  } as const;
}
