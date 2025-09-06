// 1) Immediate client-side bounce if we ever land on feed/home (defense in depth).
(function enforceJobsDefault() {
  const isFeedOrHome = (url = location.href) => {
    try {
      const u = new URL(url);
      if (u.hostname !== "www.linkedin.com") return false;

      const path = u.pathname.toLowerCase();
      const search = u.search.toLowerCase();

      // Check pathname patterns
      if (
        path === "/" ||
        path.startsWith("/feed") ||
        path.startsWith("/homepage") ||
        path === "/home"
      )
        return true;

      // Check query parameters that indicate home/feed
      if (
        search.includes("trk=homepage") ||
        search.includes("trk=nav_responsive_tab_home") ||
        search.includes("trk=home")
      )
        return true;

      return false;
    } catch {
      return false;
    }
  };

  if (isFeedOrHome()) {
    // Add cache-busting parameter to prevent cached content
    const jobsUrl = "https://www.linkedin.com/jobs/?timestamp=" + Date.now();
    location.replace(jobsUrl);
  }
})();

// 2) Block SPA navigations that try to go to feed/home.
(function guardHistory() {
  const goJobs = () => {
    const jobsUrl = "https://www.linkedin.com/jobs/?timestamp=" + Date.now();
    location.assign(jobsUrl);
  };

  const isFeedLike = (u) => {
    try {
      const x = new URL(u, location.origin);
      if (x.hostname !== "www.linkedin.com") return false;

      const path = x.pathname.toLowerCase();
      const search = x.search.toLowerCase();

      // Check pathname patterns
      if (
        path === "/" ||
        path.startsWith("/feed") ||
        path.startsWith("/homepage") ||
        path === "/home"
      )
        return true;

      // Check query parameters that indicate home/feed
      if (
        search.includes("trk=homepage") ||
        search.includes("trk=nav_responsive_tab_home") ||
        search.includes("trk=home")
      )
        return true;

      return false;
    } catch {
      return false;
    }
  };

  const wrap = (m) => {
    const orig = history[m];
    history[m] = function (...args) {
      if (args[2] && isFeedLike(args[2])) return goJobs();
      return orig.apply(this, args);
    };
  };
  wrap("pushState");
  wrap("replaceState");

  addEventListener("popstate", () => {
    if (isFeedLike(location.href)) goJobs();
  });
})();

// 3) Aggressively hide/disable "Home" UI, logo-to-feed, and any feed links.
function hideHomeUI(root = document) {
  // Anything that points to feed/home or naked "/"
  const anchorSelectors = [
    'a[href="/"]',
    'a[href="/feed/"]',
    'a[href^="/feed"]',
    'a[href^="https://www.linkedin.com/feed"]',
    'a[href="/homepage/"]',
    'a[href^="/homepage"]',
    'a[href="/home"]',
    'a.global-nav__primary-link[href^="https://www.linkedin.com/feed"]',
    'a.global-nav__primary-link[href="/"]',
    'a.global-nav__primary-link[href^="/feed"]',
    'a[data-link-to="home"]',
    'a[data-link-to="feed"]',
  ];

  // Known nav selectors (may change; we blanket-hide if they target feed)
  const semanticSelectors = [
    'a[aria-label="Home"]',
    'a[aria-label*="Home"]',
    'a[aria-current="page"][data-test-global-nav-link="feed"]',
    'a[data-test-global-nav-link="feed"]',
    'a[data-control-name="nav.home"]',
    'a[data-control-name*="home"]',
    'a[data-control-name*="feed"]',
    'a[data-test-nav="home"]',
    'a[data-test-nav="feed"]',
    'a.app-aware-link[href="/"]',
    'a.app-aware-link[href^="/feed"]',
    '.global-nav__primary-link[href="/"]',
    '.global-nav__primary-link[href^="/feed"]',
    'nav a[href="/"]',
    'nav a[href^="/feed"]',
  ];

  const buttonSelectors = [
    'button[data-view-name="navigation-homepage"]',
    'button[aria-label^="Home"]',
    'button[aria-label*="Home"]',
    'button[data-control-name*="home"]',
    'button[data-test-global-nav-button="home"]',
    'button[data-test-global-nav-button="feed"]',
  ];

  [...anchorSelectors, ...buttonSelectors].forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => {
      el.setAttribute("aria-hidden", "true");
      el.style.pointerEvents = "none";
      el.style.display = "none";
      el.style.visibility = "hidden";
      el.dataset.jobsOnlyHidden = "true";
    });
  });

  [...anchorSelectors, ...semanticSelectors].forEach((sel) => {
    root.querySelectorAll(sel).forEach((a) => {
      // If it goes to feed/home/root, retarget to jobs; otherwise hide.
      const href = a.getAttribute("href") || "";
      const abs = href.startsWith("http")
        ? href
        : new URL(href, location.origin).toString();

      const toFeed =
        /https:\/\/www\.linkedin\.com\/(?:feed(?:\/|$)|homepage(?:\/|$))/.test(
          abs
        );
      const toRoot = abs === "https://www.linkedin.com/";
      if (
        toFeed ||
        toRoot ||
        href === "/" ||
        href.startsWith("/feed/") ||
        href.startsWith("/homepage")
      ) {
        a.setAttribute("href", "/jobs/");
        a.setAttribute("aria-hidden", "true");
        a.style.pointerEvents = "none";
        a.style.display = "none";
        a.style.visibility = "hidden";
        a.dataset.jobsOnlyHidden = "true";
      }
    });
  });

  // Nuke any rendered feed containers if they appear for a moment
  const feedRoots = [
    "[data-test-feed-container]",
    'main[data-page="feed"]',
    'main[data-page="home"]',
    ".feed-outlet",
    "[data-feed-position]",
    ".feed-container",
    ".scaffold-finite-scroll",
    ".core-rail",
    ".occludable-update",
    ".feed-shared-update-v2",
    "[data-urn*='urn:li:activity']",
    ".ember-view[data-page='feed']",
    ".application-outlet",
  ];
  feedRoots.forEach((sel) => {
    root.querySelectorAll(sel).forEach((n) => {
      n.innerHTML = "";
      n.style.display = "none";
      n.style.visibility = "hidden";
      n.setAttribute("aria-hidden", "true");
    });
  });
}

// 4) Capture clicks to any would-be feed/home links (logo, Home, etc.)
document.addEventListener(
  "click",
  (e) => {
    try {
      // Check if clicked element or its parent is a link
      const clickedElement = e.target.closest(
        "a, button, [role='link'], [role='button']"
      );
      if (!clickedElement) return;

      // Get href from link or data attributes
      const href =
        clickedElement.getAttribute("href") ||
        clickedElement.getAttribute("data-href") ||
        clickedElement.getAttribute("data-link-to") ||
        "";

      if (!href) return;

      // Use the same enhanced detection logic
      const isFeedOrHomeLink = () => {
        try {
          const url = href.startsWith("http")
            ? href
            : new URL(href, location.origin).toString();
          const u = new URL(url);

          if (u.hostname !== "www.linkedin.com") return false;

          const path = u.pathname.toLowerCase();
          const search = u.search.toLowerCase();

          // Check pathname patterns
          if (
            path === "/" ||
            path.startsWith("/feed") ||
            path.startsWith("/homepage") ||
            path === "/home"
          )
            return true;

          // Check query parameters that indicate home/feed
          if (
            search.includes("trk=homepage") ||
            search.includes("trk=nav_responsive_tab_home") ||
            search.includes("trk=home")
          )
            return true;

          return false;
        } catch {
          // If URL parsing fails, check the raw href
          return (
            href === "/" ||
            href.startsWith("/feed") ||
            href.startsWith("/homepage") ||
            href.startsWith("/home")
          );
        }
      };

      if (isFeedOrHomeLink()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();

        // Add cache-busting and redirect
        const jobsUrl =
          "https://www.linkedin.com/jobs/?timestamp=" + Date.now();
        location.assign(jobsUrl);
      }
    } catch (err) {
      console.warn("LinkedIn Jobs-Only: Click handler error:", err);
    }
  },
  true
);

// 5) Keep re-applying on React updates and late mounts.
const mo = new MutationObserver((muts) => {
  try {
    let needsUpdate = false;

    for (const m of muts) {
      if (m.type === "childList") {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) {
            // element node
            hideHomeUI(n);
            needsUpdate = true;
          }
        });
      } else if (
        m.type === "attributes" &&
        m.target &&
        m.target.matches &&
        (m.target.matches("a") ||
          m.target.matches("button") ||
          m.target.matches("[role='link']") ||
          m.target.matches("[role='button']"))
      ) {
        hideHomeUI(m.target.parentElement || document);
        needsUpdate = true;
      }
    }

    // Batch DOM updates for better performance
    if (needsUpdate) {
      setTimeout(() => hideHomeUI(), 0);
    }
  } catch (err) {
    console.warn("LinkedIn Jobs-Only: MutationObserver error:", err);
    // Fallback: try to run hideHomeUI anyway
    try {
      hideHomeUI();
    } catch (fallbackErr) {
      console.warn(
        "LinkedIn Jobs-Only: Fallback hideHomeUI error:",
        fallbackErr
      );
    }
  }
});

mo.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: [
    "href",
    "aria-label",
    "aria-current",
    "data-test-global-nav-link",
    "data-control-name",
    "data-test-nav",
    "data-link-to",
    "data-href",
    "data-view-name",
    "data-test-global-nav-button",
  ],
});

// Initial passes + aggressive early timing to catch race conditions
hideHomeUI();

// Immediate burst for very early content
setTimeout(() => hideHomeUI(), 0);
setTimeout(() => hideHomeUI(), 10);
setTimeout(() => hideHomeUI(), 50);
setTimeout(() => hideHomeUI(), 100);

// Medium-term updates for delayed loading
let bursts = 0;
const burst = setInterval(() => {
  try {
    hideHomeUI();
    bursts += 1;
    if (bursts > 25) clearInterval(burst); // ~12.5s of bursts at 500ms
  } catch (err) {
    console.warn("LinkedIn Jobs-Only: Burst hideHomeUI error:", err);
  }
}, 500);

// Additional check when page becomes visible (handles tab switching)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    setTimeout(() => hideHomeUI(), 10);
  }
});

// Check on focus events (handles window switching)
window.addEventListener("focus", () => {
  setTimeout(() => hideHomeUI(), 10);
});

// 6) Block potential keyboard shortcuts to home
document.addEventListener(
  "keydown",
  (e) => {
    try {
      const k = e.key.toLowerCase();
      const modifierPressed = e.altKey || e.metaKey || e.ctrlKey;

      // Block various home shortcuts
      if (modifierPressed && (k === "h" || k === "home")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const jobsUrl =
          "https://www.linkedin.com/jobs/?timestamp=" + Date.now();
        location.assign(jobsUrl);
      }

      // Block Alt+Home specifically (common browser shortcut)
      if (e.altKey && k === "home") {
        e.preventDefault();
        e.stopImmediatePropagation();
        const jobsUrl =
          "https://www.linkedin.com/jobs/?timestamp=" + Date.now();
        location.assign(jobsUrl);
      }
    } catch (err) {
      console.warn("LinkedIn Jobs-Only: Keyboard handler error:", err);
    }
  },
  true
);

// 7) Monitor URL changes that might slip through (for extra safety)
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // Check if we somehow landed on feed/home despite all protections
    const isFeedOrHome = (url = location.href) => {
      try {
        const u = new URL(url);
        if (u.hostname !== "www.linkedin.com") return false;

        const path = u.pathname.toLowerCase();
        const search = u.search.toLowerCase();

        if (
          path === "/" ||
          path.startsWith("/feed") ||
          path.startsWith("/homepage") ||
          path === "/home"
        )
          return true;

        if (
          search.includes("trk=homepage") ||
          search.includes("trk=nav_responsive_tab_home") ||
          search.includes("trk=home")
        )
          return true;

        return false;
      } catch {
        return false;
      }
    };

    if (isFeedOrHome()) {
      const jobsUrl = "https://www.linkedin.com/jobs/?timestamp=" + Date.now();
      location.replace(jobsUrl);
    }

    // Always run hideHomeUI when URL changes
    setTimeout(() => hideHomeUI(), 10);
  }
}, 250); // Check every 250ms for URL changes
