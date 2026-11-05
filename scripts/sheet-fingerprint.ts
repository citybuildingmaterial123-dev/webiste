/**
 * Prints a fingerprint (SHA-256) of the product sheet's current contents.
 * Used by .github/workflows/refresh-catalogue.yml to detect sheet edits.
 * Reads the same environment variables as the catalogue sync.
 * Exit codes: 0 = printed, 2 = no sheet configured, 1 = sheet could not be read.
 */
import { createHash } from "node:crypto";
import { fetchSheetRows, isSheetConfigured, sheetConfigFromEnv } from "../lib/googleSheets";

async function main() {
  const config = sheetConfigFromEnv();
  if (!isSheetConfigured(config)) {
    console.error("No Google Sheet configured (GOOGLE_SHEET_ID or GOOGLE_SHEET_CSV_URL).");
    process.exit(2);
  }
  const { rows } = await fetchSheetRows(config);
  process.stdout.write(createHash("sha256").update(JSON.stringify(rows)).digest("hex"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
