(function () {
  "use strict";

  console.log("Glueful Auto Capture loaded");

  // Prevent duplicate captures for the same job during this page session
  const capturedJobs = new Set();

  function getPageInfo() {
    const title = document.title || "";
    const url = window.location.href;

    return {
      source_type: "browser_extension",
      source_name: getSourceName(),
      source_url: url,
      company: detectCompany(),
      role: detectJobTitle(),
      job_url: url,
      applied_at: new Date().toISOString(),

      // Important:
      // Clicking Apply does NOT mean the application is confirmed yet.
      status: "Pending"
    };
  }

  function getSourceName() {
    const host = window.location.hostname;

    if (host.includes("linkedin.com")) {
      return "LinkedIn";
    }

    if (host.includes("naukri.com")) {
      return "Naukri";
    }

    if (host.includes("indeed.com")) {
      return "Indeed";
    }

    return "Unknown";
  }

  function parseTitleParts() {
    const title = document.title || "";

    const parts = title
      .split("|")
      .map(p => p.trim())
      .filter(Boolean);

    return {
      role: parts.length > 0 ? parts[0] : "",
      company: parts.length > 1 ? parts[1] : ""
    };
  }

  function detectCompany() {
    const selectors = [
      '[data-testid="company-name"]',
      '[class*="company-name"]',
      '[class*="companyName"]',
      '[class*="employer"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);

      if (element && element.innerText.trim()) {
        return element.innerText.trim();
      }
    }

    return parseTitleParts().company;
  }

  function detectJobTitle() {
    const selectors = [
      'h1',
      '[data-testid="job-title"]',
      '[class*="job-title"]',
      '[class*="jobTitle"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);

      if (element && element.innerText.trim()) {
        return element.innerText.trim();
      }
    }

    const fallbackRole = parseTitleParts().role;

    return fallbackRole || document.title || "";
  }

  function sendApplication() {
    const application = getPageInfo();

    console.log("Glueful captured application:", application);

    chrome.runtime.sendMessage(
      {
        type: "GLUEFUL_CAPTURE_APPLICATION",
        application: application
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Glueful extension error:",
            chrome.runtime.lastError.message
          );
          return;
        }

        console.log("Glueful response:", response);
      }
    );
  }

  /*
   * Detect LinkedIn Apply / Easy Apply clicks.
   *
   * We use event delegation because LinkedIn dynamically
   * creates and replaces buttons.
   */

  document.addEventListener(
    "click",
    function (event) {
      // Find the actual button/link that was clicked.
      const applyElement = event.target.closest(
        'button, a, [role="button"]'
      );

      if (!applyElement) {
        return;
      }

      const text = (applyElement.innerText || "")
        .trim()
        .replace(/\s+/g, " ");

      const className =
        typeof applyElement.className === "string"
          ? applyElement.className
          : "";

      const isLinkedInApplyButton =
        className.includes("jobs-apply-button");

      const isApplyText =
        /^(apply|easy apply|apply now|apply on company website)$/i.test(
          text
        );

      if (!isLinkedInApplyButton && !isApplyText) {
        return;
      }

      const jobUrl = window.location.href;

      // Prevent duplicate capture on repeated clicks.
      if (capturedJobs.has(jobUrl)) {
        console.log(
          "Glueful: application already captured for this job."
        );
        return;
      }

      capturedJobs.add(jobUrl);

      console.log(
        "Glueful: Apply button detected:",
        text
      );

      // Capture immediately, before LinkedIn navigates away.
      sendApplication();
    },
    true
  );

  /*
   * TEST MODE
   *
   * Keeps the manual test function available.
   */
  window.gluefulCaptureTest = sendApplication;

})();
