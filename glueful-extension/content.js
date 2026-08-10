(function () {
  "use strict";

  console.log("Glueful Auto Capture loaded");

  let applicationSubmitted = false;
  let confirmationObserver = null;
  let confirmationCheckTimer = null;

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
    if (applicationSubmitted) {
      console.log(
        "Glueful: application already captured. Skipping duplicate."
      );
      return;
    }

    applicationSubmitted = true;

    stopConfirmationWatcher();

    const application = getPageInfo();

    console.log(
      "Glueful confirmed application submission:",
      application
    );

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

          /*
           * If sending failed, allow another attempt.
           */
          applicationSubmitted = false;

          return;
        }

        console.log(
          "Glueful response:",
          response
        );
      }
    );
  }


  /*
   * ============================================================
   * LINKEDIN APPLICATION CONFIRMATION DETECTION
   * ============================================================
   *
   * We DO NOT capture an application when the user clicks
   * Easy Apply.
   *
   * Instead, after Easy Apply is detected, we start watching
   * the page for LinkedIn's successful submission message.
   *
   * Examples observed during testing:
   *
   * "Your application was sent to UST!"
   *
   * "Application submitted"
   *
   * Only after one of these confirmation messages appears
   * do we send the application to Glueful.
   */

  function isApplicationConfirmationVisible() {
    const bodyText = (
      document.body?.innerText || ""
    ).trim();

    if (!bodyText) {
      return false;
    }

    /*
     * Strong confirmation:
     *
     * "Your application was sent to UST!"
     */
    const sentConfirmation =
      /your application was sent to/i.test(bodyText);

    /*
     * Secondary confirmation:
     *
     * "Application submitted"
     */
    const submittedConfirmation =
      /\bapplication submitted\b/i.test(bodyText);

    return (
      sentConfirmation ||
      submittedConfirmation
    );
  }


  function checkForApplicationConfirmation() {
    /*
     * Don't continue checking after we've already
     * captured the application.
     */
    if (applicationSubmitted) {
      return;
    }

    if (!isApplicationConfirmationVisible()) {
      return;
    }

    console.log(
      "Glueful: LinkedIn application confirmation detected."
    );

    sendApplication();
  }


  function startConfirmationWatcher() {
    /*
     * Don't create multiple observers for the same
     * application process.
     */
    if (confirmationObserver) {
      return;
    }

    console.log(
      "Glueful: watching for LinkedIn application confirmation..."
    );

    /*
     * Check once immediately in case the confirmation
     * appeared extremely quickly.
     */
    checkForApplicationConfirmation();

    /*
     * LinkedIn uses React and dynamically changes the DOM.
     *
     * MutationObserver allows us to detect text/UI changes
     * without relying on LinkedIn's changing CSS classes.
     */
    confirmationObserver = new MutationObserver(() => {
      /*
       * Multiple DOM changes can happen very quickly.
       *
       * Debounce the confirmation check so we don't scan
       * the entire page hundreds of times.
       */
      clearTimeout(confirmationCheckTimer);

      confirmationCheckTimer = setTimeout(() => {
        checkForApplicationConfirmation();
      }, 100);
    });

    confirmationObserver.observe(
      document.body,
      {
        childList: true,
        subtree: true,
        characterData: true
      }
    );
  }


  function stopConfirmationWatcher() {
    if (confirmationObserver) {
      confirmationObserver.disconnect();
      confirmationObserver = null;
    }

    if (confirmationCheckTimer) {
      clearTimeout(confirmationCheckTimer);
      confirmationCheckTimer = null;
    }

    console.log(
      "Glueful: confirmation watcher stopped."
    );
  }


  /*
   * ============================================================
   * APPLY BUTTON DETECTION
   * ============================================================
   *
   * This part is based on the working code we already tested.
   *
   * It detects:
   *
   *   Apply
   *   Easy Apply
   *
   * But it DOES NOT send the application.
   *
   * It only starts the confirmation watcher.
   */

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;

      /*
       * Make sure the clicked object is an HTML element.
       */
      if (!(target instanceof Element)) {
        return;
      }

      /*
       * The user may click a <span>, <svg>, icon, etc.
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
      const text = (
        clickable.innerText || ""
      ).trim();

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
       *
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

      /*
       * IMPORTANT:
       *
       * We DO NOT call sendApplication() here.
       *
       * We only start watching for the successful
       * LinkedIn submission confirmation.
       */
      startConfirmationWatcher();
    },
    true
  );


  /*
   * ============================================================
   * TEST MODE
   * ============================================================
   *
   * Manual testing from the browser console:
   *
   *     gluefulCaptureTest()
   *
   * This bypasses the Apply/confirmation detector and
   * directly tests the existing send pipeline.
   */

  window.gluefulCaptureTest = sendApplication;

})();
