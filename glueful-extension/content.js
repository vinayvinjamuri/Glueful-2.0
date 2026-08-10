(function () {
  "use strict";

  console.log("Glueful Auto Capture loaded");

  let applicationSubmitted = false;
  let confirmationObserver = null;
  let confirmationCheckTimer = null;


  /*
   * ============================================================
   * PAGE INFORMATION
   * ============================================================
   */

  function getPageInfo() {
    const url = window.location.href;

    return {
      source_type: "browser_extension",
      source_name: getSourceName(),
      source_url: url,

      company: detectCompany(),
      role: detectJobTitle(),
      location: detectLocation(),

      job_url: url,

      applied_at: new Date().toISOString(),

      status: "applied"
    };
  }


  /*
   * ============================================================
   * SOURCE
   * ============================================================
   */

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


  /*
   * ============================================================
   * LINKEDIN TITLE FALLBACK
   * ============================================================
   */

  function parseTitleParts() {
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


  /*
   * ============================================================
   * COMPANY DETECTION
   * ============================================================
   *
   * IMPORTANT:
   *
   * Do NOT use broad selectors such as:
   *
   * [class*="employer"]
   *
   * because LinkedIn can use those containers for other
   * information such as location.
   */

  function detectCompany() {

    /*
     * ----------------------------------------------------------
     * LinkedIn
     * ----------------------------------------------------------
     */

    if (
      window.location.hostname.includes("linkedin.com")
    ) {

      const linkedinSelectors = [
        ".job-details-jobs-unified-top-card__company-name a",
        ".job-details-jobs-unified-top-card__company-name",
        ".jobs-unified-top-card__company-name a",
        ".jobs-unified-top-card__company-name"
      ];

      for (const selector of linkedinSelectors) {

        const element =
          document.querySelector(selector);

        if (element) {

          const text =
            (element.innerText || "")
              .trim();

          if (
            text &&
            !looksLikeLocation(text)
          ) {
            return cleanText(text);
          }
        }
      }
    }


    /*
     * ----------------------------------------------------------
     * Generic company selectors
     * ----------------------------------------------------------
     */

    const selectors = [
      '[data-testid="company-name"]',
      '[class*="company-name"]',
      '[class*="companyName"]'
    ];

    for (const selector of selectors) {

      const element =
        document.querySelector(selector);

      if (!element) {
        continue;
      }

      const text =
        (element.innerText || "")
          .trim();

      if (
        text &&
        !looksLikeLocation(text)
      ) {
        return cleanText(text);
      }
    }


    /*
     * ----------------------------------------------------------
     * Fallback
     * ----------------------------------------------------------
     */

    const fallback =
      parseTitleParts().company;

    if (
      fallback &&
      !looksLikeLocation(fallback)
    ) {
      return cleanText(fallback);
    }

    return "";
  }


  /*
   * ============================================================
   * JOB TITLE DETECTION
   * ============================================================
   */

  function detectJobTitle() {

    if (
      window.location.hostname.includes("linkedin.com")
    ) {

      const linkedinSelectors = [
        ".job-details-jobs-unified-top-card__job-title h1",
        ".job-details-jobs-unified-top-card__job-title",
        ".jobs-unified-top-card__job-title h1",
        ".jobs-unified-top-card__job-title",
        "h1"
      ];

      for (const selector of linkedinSelectors) {

        const element =
          document.querySelector(selector);

        if (element) {

          const text =
            (element.innerText || "")
              .trim();

          if (text) {
            return cleanText(text);
          }
        }
      }
    }


    const selectors = [
      '[data-testid="job-title"]',
      '[class*="job-title"]',
      '[class*="jobTitle"]',
      "h1"
    ];

    for (const selector of selectors) {

      const element =
        document.querySelector(selector);

      if (!element) {
        continue;
      }

      const text =
        (element.innerText || "")
          .trim();

      if (text) {
        return cleanText(text);
      }
    }


    const fallbackRole =
      parseTitleParts().role;

    return (
      fallbackRole ||
      document.title ||
      ""
    );
  }


  /*
   * ============================================================
   * LOCATION DETECTION
   * ============================================================
   */

  function detectLocation() {

    if (
      window.location.hostname.includes("linkedin.com")
    ) {

      const selectors = [
        ".job-details-jobs-unified-top-card__primary-description-container",
        ".jobs-unified-top-card__primary-description-container",
        ".job-details-jobs-unified-top-card__primary-description",
        ".jobs-unified-top-card__primary-description"
      ];

      for (const selector of selectors) {

        const element =
          document.querySelector(selector);

        if (!element) {
          continue;
        }

        const text =
          (element.innerText || "")
            .trim();

        if (!text) {
          continue;
        }

        /*
         * LinkedIn often displays something similar to:
         *
         * Company Name · Hyderabad, Telangana, India
         *
         * or:
         *
         * Hyderabad, Telangana, India · 1 day ago
         *
         */

        const parts =
          text
            .split("·")
            .map((part) => part.trim())
            .filter(Boolean);

        for (const part of parts) {

          if (
            looksLikeLocation(part)
          ) {
            return cleanText(part);
          }
        }
      }
    }

    return "";
  }


  /*
   * ============================================================
   * LOCATION HEURISTIC
   * ============================================================
   */

  function looksLikeLocation(value) {

    const text =
      cleanText(value).toLowerCase();

    if (!text) {
      return false;
    }

    const locationWords = [
      "india",
      "telangana",
      "hyderabad",
      "bangalore",
      "bengaluru",
      "mumbai",
      "pune",
      "delhi",
      "gurgaon",
      "gurugram",
      "noida",
      "chennai",
      "kolkata",
      "remote",
      "onsite",
      "on-site",
      "hybrid",
      "united states",
      "usa",
      "new york",
      "california",
      "texas",
      "washington",
      "canada",
      "uk",
      "london"
    ];

    return locationWords.some(
      (word) =>
        text === word ||
        text.includes(word)
    );
  }


  /*
   * ============================================================
   * TEXT CLEANING
   * ============================================================
   */

  function cleanText(value) {

    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }


  /*
   * ============================================================
   * SEND APPLICATION
   * ============================================================
   */

  function sendApplication() {

    if (applicationSubmitted) {

      console.log(
        "Glueful: application already captured. Skipping duplicate."
      );

      return;
    }

    applicationSubmitted = true;

    stopConfirmationWatcher();

    const application =
      getPageInfo();

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
   */

  function isApplicationConfirmationVisible() {

    const bodyText =
      (
        document.body?.innerText ||
        ""
      ).trim();

    if (!bodyText) {
      return false;
    }

    const sentConfirmation =
      /your application was sent to/i
        .test(bodyText);

    const submittedConfirmation =
      /\bapplication submitted\b/i
        .test(bodyText);

    return (
      sentConfirmation ||
      submittedConfirmation
    );
  }


  function checkForApplicationConfirmation() {

    if (applicationSubmitted) {
      return;
    }

    if (
      !isApplicationConfirmationVisible()
    ) {
      return;
    }

    console.log(
      "Glueful: LinkedIn application confirmation detected."
    );

    sendApplication();
  }


  function startConfirmationWatcher() {

    if (confirmationObserver) {
      return;
    }

    console.log(
      "Glueful: watching for LinkedIn application confirmation..."
    );

    checkForApplicationConfirmation();

    confirmationObserver =
      new MutationObserver(() => {

        clearTimeout(
          confirmationCheckTimer
        );

        confirmationCheckTimer =
          setTimeout(() => {

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

      clearTimeout(
        confirmationCheckTimer
      );

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
   */

  document.addEventListener(
    "click",
    (event) => {

      const target =
        event.target;

      if (
        !(target instanceof Element)
      ) {
        return;
      }

      const clickable =
        target.closest(
          'button, [role="button"], a'
        );

      if (!clickable) {
        return;
      }

      if (
        clickable instanceof HTMLButtonElement &&
        clickable.disabled
      ) {
        return;
      }

      const text =
        (
          clickable.innerText ||
          ""
        ).trim();

      const ariaLabel =
        (
          clickable.getAttribute(
            "aria-label"
          ) || ""
        ).trim();

      const isApplyButton =
        /^apply$/i.test(text) ||
        /^easy\s+apply$/i.test(text) ||
        /^apply$/i.test(ariaLabel) ||
        /^easy\s+apply$/i.test(ariaLabel);

      if (!isApplyButton) {
        return;
      }

      console.log(
        "Glueful Apply button detected:",
        {
          text: text,
          ariaLabel: ariaLabel,
          tagName: clickable.tagName,
          href:
            clickable.getAttribute(
              "href"
            ) || null
        }
      );

      startConfirmationWatcher();
    },
    true
  );


  /*
   * ============================================================
   * TEST MODE
   * ============================================================
   */

  window.gluefulCaptureTest =
    sendApplication;

})();
