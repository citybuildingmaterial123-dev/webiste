/**
 * Google Sheets service: BUILD TIME ONLY.
 *
 * Called by `scripts/sync-catalog.ts` before `next build`. The website itself
 * never talks to Google: pages are generated from the JSON this step produces.
 *
 * Four ways to read the sheet, chosen automatically from environment variables:
 *
 *  1. GOOGLE_SHEET_CSV_URL                   "Publish to web" CSV link
 *  2. GOOGLE_SERVICE_ACCOUNT_EMAIL + _KEY   private sheet shared with a service account
 *  3. GOOGLE_SHEETS_API_KEY                 Sheets API v4 with an API key
 *  4. (nothing else)                        public CSV export of a link-shared sheet
 */
import { createSign } from "node:crypto";
import { parseCsv } from "./csv";

export interface SheetSourceConfig {
  sheetId?: string;
  /** Numeric tab id (`#gid=` in the sheet URL). Used by the public CSV export. */
  gid?: string;
  /** Tab name. Used by the API modes. */
  tab?: string;
  csvUrl?: string;
  apiKey?: string;
  serviceAccount?: { clientEmail: string; privateKey: string };
}

export type SheetAccessMode = "published-csv" | "service-account" | "api-key" | "public-csv";

export interface SheetFetchResult {
  rows: string[][];
  mode: SheetAccessMode;
}

export class SheetFetchError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SheetFetchError";
  }
}

const REQUEST_TIMEOUT_MS = 20_000;
const RETRIES = 2;

/** Reads the sheet configuration from environment variables. */
export function sheetConfigFromEnv(env: NodeJS.ProcessEnv = process.env): SheetSourceConfig {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const key = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  return {
    sheetId: env.GOOGLE_SHEET_ID?.trim() || undefined,
    gid: env.GOOGLE_SHEET_GID?.trim() || undefined,
    tab: env.GOOGLE_SHEET_TAB?.trim() || undefined,
    csvUrl: env.GOOGLE_SHEET_CSV_URL?.trim() || undefined,
    apiKey: env.GOOGLE_SHEETS_API_KEY?.trim() || undefined,
    serviceAccount:
      email && key
        ? // Hosting dashboards usually store the key with literal "\n" sequences.
          { clientEmail: email, privateKey: key.replace(/\\n/g, "\n") }
        : undefined,
  };
}

/** True when enough configuration exists to attempt a fetch. */
export function isSheetConfigured(config: SheetSourceConfig): boolean {
  return Boolean(config.csvUrl || config.sheetId);
}

export function resolveAccessMode(config: SheetSourceConfig): SheetAccessMode {
  if (config.csvUrl) return "published-csv";
  if (config.serviceAccount) return "service-account";
  if (config.apiKey) return "api-key";
  return "public-csv";
}

/** Fetches all rows (header row first) from the configured sheet tab. */
export async function fetchSheetRows(config: SheetSourceConfig): Promise<SheetFetchResult> {
  if (!isSheetConfigured(config)) {
    throw new SheetFetchError("No Google Sheet configured (set GOOGLE_SHEET_ID or GOOGLE_SHEET_CSV_URL).");
  }
  const mode = resolveAccessMode(config);
  const tab = config.tab || "Products";

  switch (mode) {
    case "published-csv":
      return { mode, rows: parseCsvResponse(await fetchText(config.csvUrl!)) };

    case "public-csv": {
      const id = encodeURIComponent(config.sheetId!);
      // The export endpoint returns cell values exactly as shown. It needs the tab's gid.
      // If only a tab name is given, fall back to the gviz endpoint, which accepts names.
      const url =
        config.gid || !config.tab
          ? `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${encodeURIComponent(config.gid || "0")}`
          : `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(config.tab)}`;
      return { mode, rows: parseCsvResponse(await fetchText(url)) };
    }

    case "api-key": {
      const url = valuesApiUrl(config.sheetId!, tab) + `&key=${encodeURIComponent(config.apiKey!)}`;
      return { mode, rows: await fetchValues(url) };
    }

    case "service-account": {
      const token = await getServiceAccountToken(config.serviceAccount!);
      return { mode, rows: await fetchValues(valuesApiUrl(config.sheetId!, tab), token) };
    }
  }
}

function valuesApiUrl(sheetId: string, tab: string): string {
  return (
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
    `/values/${encodeURIComponent(tab)}?valueRenderOption=FORMATTED_VALUE&majorDimension=ROWS`
  );
}

async function fetchValues(url: string, bearerToken?: string): Promise<string[][]> {
  const text = await fetchText(url, bearerToken ? { Authorization: `Bearer ${bearerToken}` } : undefined);
  let json: { values?: unknown[][] };
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new SheetFetchError("Google Sheets API returned a response that is not JSON.", { cause: error });
  }
  const values = json.values ?? [];
  return values.map((row) => row.map((cell) => (cell == null ? "" : String(cell))));
}

function parseCsvResponse(text: string): string[][] {
  const head = text.slice(0, 200).trimStart().toLowerCase();
  if (head.startsWith("<!doctype html") || head.startsWith("<html")) {
    throw new SheetFetchError(
      "Google returned a web page instead of CSV. The sheet is probably not shared. " +
        'Share it as "Anyone with the link: Viewer", publish it to the web as CSV, ' +
        "or configure a service account (see .env.example).",
    );
  }
  return parseCsv(text);
}

async function fetchText(url: string, headers?: Record<string, string>): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "catalog-sync/1.0", ...headers },
        redirect: "follow",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (response.ok) return await response.text();

      const error = new SheetFetchError(describeHttpError(response.status, await response.text().catch(() => "")));
      // 4xx (bad ID, no access, bad key) will not fix itself on retry.
      if (response.status < 500 && response.status !== 429) throw error;
      lastError = error;
    } catch (error) {
      if (error instanceof SheetFetchError && !/HTTP (5\d\d|429)/.test(error.message)) throw error;
      lastError = error;
    }
    if (attempt < RETRIES) await sleep(1000 * 2 ** attempt);
  }
  throw new SheetFetchError(`Could not reach Google Sheets after ${RETRIES + 1} attempts.`, { cause: lastError });
}

/** Plain-language explanation of an HTTP error from Google (no HTML dumps in build logs). */
function describeHttpError(status: number, body: string): string {
  const hint =
    status === 404
      ? "sheet or tab not found. Check GOOGLE_SHEET_ID and GOOGLE_SHEET_GID / GOOGLE_SHEET_TAB."
      : status === 401 || status === 403
        ? 'no access. Share the sheet as "Anyone with the link: Viewer", or share it with the service account, or check the API key.'
        : status === 400
          ? "bad request. Check the tab name (GOOGLE_SHEET_TAB) and the API key."
          : status === 429
            ? "too many requests. Try again in a minute."
            : "Google had a temporary problem.";
  // JSON API errors carry a useful message; HTML error pages do not.
  let detail = "";
  try {
    detail = (JSON.parse(body) as { error?: { message?: string } }).error?.message ?? "";
  } catch {
    // not JSON
  }
  return `HTTP ${status}: ${hint}${detail ? ` (${detail})` : ""}`;
}

/** OAuth access token for a service account (JWT bearer flow, RS256). */
async function getServiceAccountToken(account: { clientEmail: string; privateKey: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned =
    encode({ alg: "RS256", typ: "JWT" }) +
    "." +
    encode({
      iss: account.clientEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    });

  let signature: string;
  try {
    signature = createSign("RSA-SHA256").update(unsigned).sign(account.privateKey).toString("base64url");
  } catch (error) {
    throw new SheetFetchError(
      "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY could not be read. Paste the full key including the BEGIN/END lines.",
      { cause: error },
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const json = (await response.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!response.ok || !json.access_token) {
    throw new SheetFetchError(
      `Service account sign-in failed (HTTP ${response.status})${json.error_description ? `: ${json.error_description}` : ""}.`,
    );
  }
  return json.access_token;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
