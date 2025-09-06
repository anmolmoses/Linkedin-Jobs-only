// Redirect any visit to root or feed to /jobs/
const shouldRedirectToJobs = (urlStr) => {
  try {
    const url = new URL(urlStr);
    if (url.hostname !== "www.linkedin.com") return false;

    const path = url.pathname.toLowerCase().replace(/\/+$/, ""); // trim trailing slash and normalize
    const search = url.search.toLowerCase();

    // Common home/feed paths
    if (
      path === "" ||
      path === "/feed" ||
      path === "/homepage" ||
      path === "/home"
    )
      return true;

    // Any path starting with /feed or /homepage
    if (path.startsWith("/feed") || path.startsWith("/homepage")) return true;

    // Check for home/feed tracking parameters
    if (
      search.includes("trk=homepage") ||
      search.includes("trk=nav_responsive_tab_home") ||
      search.includes("trk=home") ||
      search.includes("trk=feed")
    )
      return true;

    // Root with any query parameters (often leads to feed)
    if (path === "" && search) return true;

    return false;
  } catch {
    return false;
  }
};

chrome.webNavigation.onCommitted.addListener(
  async (details) => {
    // Skip reloads and subframes, but allow other navigation types
    if (details.transitionType === "auto_subframe") return;

    try {
      if (shouldRedirectToJobs(details.url)) {
        // Add cache-busting parameter to prevent cached content
        const jobsUrl =
          "https://www.linkedin.com/jobs/?timestamp=" + Date.now();
        await chrome.tabs.update(details.tabId, {
          url: jobsUrl,
        });
      }
    } catch (e) {
      // Tab may be gone or other error; log and ignore
      console.warn("LinkedIn Jobs-Only: Background redirect error:", e);
    }
  },
  { url: [{ hostEquals: "www.linkedin.com" }] }
);

// Also listen for onBeforeNavigate for even earlier interception
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    // Only handle main frame navigations
    if (details.frameId !== 0) return;

    try {
      if (shouldRedirectToJobs(details.url)) {
        const jobsUrl =
          "https://www.linkedin.com/jobs/?timestamp=" + Date.now();
        await chrome.tabs.update(details.tabId, {
          url: jobsUrl,
        });
      }
    } catch (e) {
      console.warn("LinkedIn Jobs-Only: Background before-navigate error:", e);
    }
  },
  { url: [{ hostEquals: "www.linkedin.com" }] }
);
