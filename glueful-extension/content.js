(function () {
  "use strict";

  console.log("Glueful Auto Capture loaded");

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
      status: "Applied"
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
    // LinkedIn job titles usually look like:
    // "Job Title | Company Name | LinkedIn"

    const title = document.title || "";

    const parts = title
      .split("|")
      .map((p) => p.trim())
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
      "h1",
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
   * APPLY BUTTON DETECTION
   *
   * For now this ONLY detects when the user clicks
   * an Apply / Easy Apply button.
   *
   * It does NOT send anything to Glueful yet.
   */

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;

      // Make sure the clicked object is an HTML element.
      if (!(target instanceof Element)) {
        return;
      }

      /*
       * The user may click on a <span>, <svg>, icon, etc.
       * inside the actual Apply button.
       *
       * closest() walks upward and finds the real
       * clickable element.
       */
      const clickable = target.closest(
        'button, [role="button"], a'
      );

      if (!clickable) {
        return;
      }

      /*
       * Ignore disabled buttons.
       */
      if (
        clickable instanceof HTMLButtonElement &&
        clickable.disabled
      ) {
        return;
      }

      /*
       * Get visible text from the clicked element.
       */
      const text = (clickable.innerText || "").trim();

      /*
       * Also check aria-label.
       */
      const ariaLabel = (
        clickable.getAttribute("aria-label") || ""
      ).trim();

      /*
       * Only recognize exact Apply / Easy Apply labels.
       *
       * This prevents unrelated things such as:
       * "See who's applied"
       * "Applying filters"
       * "Applications"
       * etc.
       */
      const isApplyButton =
        /^apply$/i.test(text) ||
        /^easy\s+apply$/i.test(text) ||
        /^apply$/i.test(ariaLabel) ||
        /^easy\s+apply$/i.test(ariaLabel);

      if (!isApplyButton) {
        return;
      }

      /*
       * APPLY DETECTED
       *
       * IMPORTANT:
       * We are NOT calling sendApplication() yet.
       */
      console.log(
        "Glueful Apply button detected:",
        {
          text: text,
          ariaLabel: ariaLabel,
          tagName: clickable.tagName,
          href: clickable.getAttribute("href") || null
        }
      );
    },
    true
  );


  /*
   * TEST MODE
   *
   * This allows manual testing from the browser console:
   *
   * gluefulCaptureTest()
   *
   * We are keeping this because the manual pipeline
   * has already been tested successfully.
   */

  window.gluefulCaptureTest = sendApplication;

})();
