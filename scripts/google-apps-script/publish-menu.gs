/**
 * "Website > Publish changes" menu for the product Google Sheet.
 *
 * The website is static: product changes appear after it is rebuilt. This menu
 * calls your host's deploy hook, which rebuilds the site from the sheet.
 *
 * Setup (once):
 *  1. In your host, create a deploy hook URL
 *     - Vercel: Project > Settings > Git > Deploy Hooks
 *     - Netlify: Site configuration > Build & deploy > Build hooks
 *     - Cloudflare Pages: Settings > Builds & deployments > Deploy hooks
 *  2. In the sheet: Extensions > Apps Script, paste this file, save.
 *  3. In Apps Script: Project Settings > Script properties > add
 *     DEPLOY_HOOK_URL = <the URL from step 1>   (kept out of the code)
 *  4. Reload the sheet. A "Website" menu appears. The first run asks for permission.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Website")
    .addItem("Publish changes", "publishWebsite")
    .addToUi();
}

function publishWebsite() {
  const ui = SpreadsheetApp.getUi();
  const hook = PropertiesService.getScriptProperties().getProperty("DEPLOY_HOOK_URL");
  if (!hook) {
    ui.alert("DEPLOY_HOOK_URL is not set. Add it under Apps Script > Project Settings > Script properties.");
    return;
  }
  const response = UrlFetchApp.fetch(hook, { method: "post", muteHttpExceptions: true });
  const code = response.getResponseCode();
  if (code >= 200 && code < 300) {
    ui.alert("Publishing started. The website updates in a few minutes.");
  } else {
    ui.alert("The host did not accept the request (HTTP " + code + "). Check the deploy hook URL.");
  }
}
