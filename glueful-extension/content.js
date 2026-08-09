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

    return "";
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

    return document.title || "";
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
   * TEST MODE
   *
   * For now we do NOT automatically submit anything.
   * This only exposes a function so we can test the extension safely.
   */

  window.gluefulCaptureTest = sendApplication;

})();
