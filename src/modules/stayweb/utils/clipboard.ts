/**
 * copyToClipboard
 * ───────────────
 * Tries the modern Async Clipboard API first.
 * Falls back to the legacy execCommand('copy') approach when the Clipboard
 * API is blocked by a Permissions Policy (common in iframes / sandboxed
 * environments like Figma Make previews).
 *
 * Returns true if the copy succeeded.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1 — Modern API (requires permissions / secure context)
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy approach
    }
  }

  // 2 — Legacy execCommand fallback
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    // Keep it out of view but still in the DOM so .select() works
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
