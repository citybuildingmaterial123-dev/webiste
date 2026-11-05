/**
 * "Website > Publish changes" menu for the product Google Sheet.
 *
 * The website is static: product changes appear after it is rebuilt. Without
 * this menu, the GitHub workflow "Refresh catalogue" picks up sheet edits
 * within an hour. This menu publishes immediately by starting that workflow.
 *
 * Setup (once):
 *  1. Create a GitHub fine-grained token: GitHub > Settings > Developer settings >
 *     Fine-grained tokens > Generate. Repository access: only this website's
 *     repository. Permissions: Actions = Read and write. Copy the token.
 *  2. In the sheet: Extensions > Apps Script, paste this file, save.
 *  3. Apps Script > Project Settings > Script properties > add:
 *       GITHUB_TOKEN = <the token from step 1>
 *       GITHUB_REPO  = citybuildingmaterial123-dev/webiste
 *     (Cloudflare Pages users can instead add DEPLOY_HOOK_URL = <Pages deploy hook URL>.)
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
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("GITHUB_TOKEN");
  const repo = props.getProperty("GITHUB_REPO");
  const hook = props.getProperty("DEPLOY_HOOK_URL");

  let response;
  if (token && repo) {
    response = UrlFetchApp.fetch(
      "https://api.github.com/repos/" + repo + "/actions/workflows/refresh-catalogue.yml/dispatches",
      {
        method: "post",
        contentType: "application/json",
        headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" },
        payload: JSON.stringify({ ref: "main", inputs: { force: true } }),
        muteHttpExceptions: true,
      },
    );
  } else if (hook) {
    response = UrlFetchApp.fetch(hook, { method: "post", muteHttpExceptions: true });
  } else {
    ui.alert("Not set up yet. Add GITHUB_TOKEN and GITHUB_REPO under Apps Script > Project Settings > Script properties.");
    return;
  }

  const code = response.getResponseCode();
  if (code >= 200 && code < 300) {
    ui.alert("Publishing started. The website updates in a few minutes.");
  } else {
    ui.alert("Publishing could not start (HTTP " + code + "). Check the token, repository name or hook URL.");
  }
}
