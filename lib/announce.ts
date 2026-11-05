/** Reads a short message to screen-reader users via the polite live region in the layout. */
export function announce(message: string) {
  const region = document.getElementById("announcer");
  if (!region) return;
  region.textContent = "";
  window.setTimeout(() => {
    region.textContent = message;
  }, 60);
}
