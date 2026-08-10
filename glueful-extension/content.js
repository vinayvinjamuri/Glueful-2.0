(function () {
  "use strict";

  console.log("Glueful Auto Capture loaded");

  let applicationSubmitted = false;
  let confirmationObserver = null;
  let confirmationCheckTimer = null;
  let companyRetryTimers = [];

  let pendingApplication = null;


  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
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
    const title = cleanText(document.title);

    const parts = title
      .split("|")
      .map((p) => cleanText(p))
      .filter(Boolean);

    return {
      role: parts.length > 0 ? parts[0] : "",
      company: parts.length > 1 ? parts[1] : ""
    };
  }


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
      "london",
      "australia",
      "singapore",
      "germany",
      "france"
    ];

    return locationWords.some(
      (word) =>
        text === word ||
        text.includes(word)
    );
  }


  function isValidCompany(value) {
    const text =
      cleanText(value);

    if (!text) {
      return false;
    }

    if (text.length < 2) {
      return false;
    }

    if (looksLikeLocation(text)) {
      return false;
    }

    const invalidValues = [
      "apply",
      "easy apply",
      "linkedin",
      "see more",
      "see less",
      "remote",
      "hybrid",
      "onsite",
      "on-site",
      "application submitted",
      "your application was sent to"
    ];

    if (
      invalidValues.includes(
        text.toLowerCase()
      )
    ) {
      return false;
    }

    if (
      text.length > 150
    ) {
      return false;
    }

    return true;
  }


  function detectCompanyFromLinkedInSelectors() {
    const selectors = [
      ".job-details-jobs-unified-top-card__company-name a",
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name a",
      ".jobs-unified-top-card__company-name",
      ".job-details-jobs-unified-top-card__primary-description a[href*='/company/']",
      ".jobs-unified-top-card__primary-description a[href*='/company/']",
      '[data-testid="company-name"]'
    ];

    for (const selector of selectors) {
      try {
        const elements =
          document.querySelectorAll(selector);

        for (const element of elements) {
          const text =
            cleanText(
              element.innerText ||
              element.textContent
            );

          if (
            isValidCompany(text)
          ) {
            return text;
          }
        }
      } catch (error) {
        console.warn(
          "Glueful LinkedIn company selector failed:",
          selector,
          error
        );
      }
    }

    return "";
  }


  function detectCompanyFromCompanyLinks() {
    const links =
      document.querySelectorAll(
        'a[href*="/company/"]'
      );

    const candidates = [];

    for (const link of links) {
      const text =
        cleanText(
          link.innerText ||
          link.textContent
        );

      if (
        !isValidCompany(text)
      ) {
        continue;
      }

      const rect =
        link.getBoundingClientRect();

      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        continue;
      }

      candidates.push({
        text,
        top: rect.top,
        left: rect.left
      });
    }

    candidates.sort(
      (a, b) => {
        if (a.top !== b.top) {
          return a.top - b.top;
        }

        return a.left - b.left;
      }
    );

    if (
      candidates.length > 0
    ) {
      return candidates[0].text;
    }

    return "";
  }


  function detectCompanyFromJobHeader() {
    const titleSelectors = [
      ".job-details-jobs-unified-top-card__job-title h1",
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title h1",
      ".jobs-unified-top-card__job-title"
    ];

    let jobTitleElement = null;

    for (
      const selector
      of titleSelectors
    ) {
      const element =
        document.querySelector(selector);

      if (element) {
        jobTitleElement = element;
        break;
      }
    }

    if (!jobTitleElement) {
      return "";
    }

    let parent =
      jobTitleElement.parentElement;

    let depth = 0;

    while (
      parent &&
      depth < 10
    ) {
      const companyLinks =
        parent.querySelectorAll(
          'a[href*="/company/"]'
        );

      for (
        const link
        of companyLinks
      ) {
        const text =
          cleanText(
            link.innerText ||
            link.textContent
          );

        if (
          isValidCompany(text)
        ) {
          return text;
        }
      }

      const companySelectors = [
        '[class*="company-name"]',
        '[class*="companyName"]'
      ];

      for (
        const selector
        of companySelectors
      ) {
        const elements =
          parent.querySelectorAll(
            selector
          );

        for (
          const element
          of elements
        ) {
          const text =
            cleanText(
              element.innerText ||
              element.textContent
            );

          if (
            isValidCompany(text)
          ) {
            return text;
          }
        }
      }

      parent =
        parent.parentElement;

      depth++;
    }

    return "";
  }


  function detectCompanyFromPrimaryDescription() {
    const selectors = [
      ".job-details-jobs-unified-top-card__primary-description-container",
      ".jobs-unified-top-card__primary-description-container",
      ".job-details-jobs-unified-top-card__primary-description",
      ".jobs-unified-top-card__primary-description"
    ];

    for (
      const selector
      of selectors
    ) {
      const elements =
        document.querySelectorAll(
          selector
        );

      for (
        const element
        of elements
      ) {
        const companyLinks =
          element.querySelectorAll(
            'a[href*="/company/"]'
          );

        for (
          const link
          of companyLinks
        ) {
          const text =
            cleanText(
              link.innerText ||
              link.textContent
            );

          if (
            isValidCompany(text)
          ) {
            return text;
          }
        }

        const text =
          cleanText(
            element.innerText ||
            element.textContent
          );

        if (!text) {
          continue;
        }

        const parts =
          text
            .split("·")
            .map((part) =>
              cleanText(part)
            )
            .filter(Boolean);

        for (
          const part
          of parts
        ) {
          if (
            isValidCompany(part) &&
            !looksLikeLocation(part)
          ) {
            if (
              part.length <= 100
            ) {
              return part;
            }
          }
        }
      }
    }

    return "";
  }


  function detectCompanyFromMeta() {
    const selectors = [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'meta[property="og:description"]',
      'meta[name="description"]'
    ];

    for (
      const selector
      of selectors
    ) {
      const element =
        document.querySelector(selector);

      if (!element) {
        continue;
      }

      const content =
        cleanText(
          element.getAttribute(
            "content"
          )
        );

      if (!content) {
        continue;
      }

      const parts =
        content
          .split("|")
          .map((part) =>
            cleanText(part)
          )
          .filter(Boolean);

      for (
        const part
        of parts
      ) {
        if (
          isValidCompany(part)
        ) {
          return part;
        }
      }
    }

    return "";
  }


  function detectCompanyFromBodyConfirmation() {
    const bodyText =
      cleanText(
        document.body?.innerText
      );

    if (!bodyText) {
      return "";
    }

    const patterns = [
      /your application was sent to\s+(.+?)(?:\.|\n|$)/i,
      /application was sent to\s+(.+?)(?:\.|\n|$)/i,
      /application submitted to\s+(.+?)(?:\.|\n|$)/i
    ];

    for (
      const pattern
      of patterns
    ) {
      const match =
        bodyText.match(pattern);

      if (!match) {
        continue;
      }

      const company =
        cleanText(match[1]);

      if (
        isValidCompany(company)
      ) {
        return company;
      }
    }

    return "";
  }


  function detectCompany() {
    if (
      window.location.hostname.includes(
        "linkedin.com"
      )
    ) {
      let company =
        detectCompanyFromLinkedInSelectors();

      if (company) {
        return company;
      }

      company =
        detectCompanyFromJobHeader();

      if (company) {
        return company;
      }

      company =
        detectCompanyFromCompanyLinks();

      if (company) {
        return company;
      }

      company =
        detectCompanyFromPrimaryDescription();

      if (company) {
        return company;
      }

      company =
        detectCompanyFromBodyConfirmation();

      if (company) {
        return company;
      }

      company =
        detectCompanyFromMeta();

      if (company) {
        return company;
      }
    }

    const genericSelectors = [
      '[data-testid="company-name"]',
      '[class*="company-name"]',
      '[class*="companyName"]'
    ];

    for (
      const selector
      of genericSelectors
    ) {
      try {
        const elements =
          document.querySelectorAll(
            selector
          );

        for (
          const element
          of elements
        ) {
          const text =
            cleanText(
              element.innerText ||
              element.textContent
            );

          if (
            isValidCompany(text)
          ) {
            return text;
          }
        }
      } catch (error) {
        console.warn(
          "Glueful generic company selector failed:",
          selector,
          error
        );
      }
    }

    const fallback =
      parseTitleParts().company;

    if (
      isValidCompany(fallback)
    ) {
      return fallback;
    }

    return "";
  }


  function detectJobTitle() {
    if (
      window.location.hostname.includes(
        "linkedin.com"
      )
    ) {
      const selectors = [
        ".job-details-jobs-unified-top-card__job-title h1",
        ".job-details-jobs-unified-top-card__job-title",
        ".jobs-unified-top-card__job-title h1",
        ".jobs-unified-top-card__job-title"
      ];

      for (
        const selector
        of selectors
      ) {
        try {
          const elements =
            document.querySelectorAll(
              selector
            );

          for (
            const element
            of elements
          ) {
            const text =
              cleanText(
                element.innerText ||
                element.textContent
              );

            if (text) {
              return text;
            }
          }
        } catch (error) {
          console.warn(
            "Glueful job title selector failed:",
            selector,
            error
          );
        }
      }
    }

    const selectors = [
      '[data-testid="job-title"]',
      '[class*="job-title"]',
      '[class*="jobTitle"]',
      "h1"
    ];

    for (
      const selector
      of selectors
    ) {
      try {
        const elements =
          document.querySelectorAll(
            selector
          );

        for (
          const element
          of elements
        ) {
          const text =
            cleanText(
              element.innerText ||
              element.textContent
            );

          if (text) {
            return text;
          }
        }
      } catch (error) {
        console.warn(
          "Glueful generic job title selector failed:",
          selector,
          error
        );
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


  function detectLocation() {
    if (
      window.location.hostname.includes(
        "linkedin.com"
      )
    ) {
      const selectors = [
        ".job-details-jobs-unified-top-card__primary-description-container",
        ".jobs-unified-top-card__primary-description-container",
        ".job-details-jobs-unified-top-card__primary-description",
        ".jobs-unified-top-card__primary-description"
      ];

      for (
        const selector
        of selectors
      ) {
        try {
          const elements =
            document.querySelectorAll(
              selector
            );

          for (
            const element
            of elements
          ) {
            const text =
              cleanText(
                element.innerText ||
                element.textContent
              );

            if (!text) {
              continue;
            }

            const parts =
              text
                .split("·")
                .map((part) =>
                  cleanText(part)
                )
                .filter(Boolean);

            for (
              const part
              of parts
            ) {
              if (
                looksLikeLocation(part)
              ) {
                return cleanText(part);
              }
            }
          }
        } catch (error) {
          console.warn(
            "Glueful location selector failed:",
            selector,
            error
          );
        }
      }
    }

    return "";
  }


  function getPageInfo() {
    const url =
      window.location.href;

    return {
      source_type:
        "browser_extension",

      source_name:
        getSourceName(),

      source_url:
        url,

      company:
        detectCompany(),

      role:
        detectJobTitle(),

      location:
        detectLocation(),

      job_url:
        url,

      applied_at:
        new Date().toISOString(),

      status:
        "applied"
    };
  }


  function retryCompanyDetection() {
    for (
      const timer
      of companyRetryTimers
    ) {
      clearTimeout(timer);
    }

    companyRetryTimers = [];

    const delays = [
      100,
      300,
      700,
      1200,
      2000,
      3000
    ];

    for (
      const delay
      of delays
    ) {
      const timer =
        setTimeout(() => {

          if (
            !pendingApplication ||
            applicationSubmitted
          ) {
            return;
          }

          if (
            pendingApplication.company
          ) {
            return;
          }

          const company =
            detectCompany();

          if (company) {

            pendingApplication.company =
              company;

            console.log(
              "Glueful: company detected:",
              company
            );

            return;
          }

          console.log(
            "Glueful: company not detected yet. Retrying..."
          );

        }, delay);

      companyRetryTimers.push(timer);
    }
  }


  function capturePendingApplication() {
    const pageInfo =
      getPageInfo();

    pendingApplication = {
      ...pageInfo
    };

    console.log(
      "Glueful: job information saved before application confirmation:",
      pendingApplication
    );

    retryCompanyDetection();
  }


  function sendApplication() {
    if (applicationSubmitted) {
      console.log(
        "Glueful: application already captured. Skipping duplicate."
      );

      return;
    }

    let application;

    if (pendingApplication) {
      application = {
        ...pendingApplication,
        applied_at:
          new Date().toISOString(),
        status:
          "applied"
      };
    } else {
      application =
        getPageInfo();
    }

    if (
      !application.company
    ) {
      const retryCompany =
        detectCompany();

      if (retryCompany) {
        application.company =
          retryCompany;
      }
    }

    if (
      !application.company
    ) {
      const confirmationCompany =
        detectCompanyFromBodyConfirmation();

      if (confirmationCompany) {
        application.company =
          confirmationCompany;
      }
    }

    if (
      !application.company
    ) {
      console.error(
        "Glueful: Company could not be detected. Application was NOT sent.",
        application
      );

      applicationSubmitted =
        false;

      return;
    }

    if (
      !application.role
    ) {
      const retryRole =
        detectJobTitle();

      if (retryRole) {
        application.role =
          retryRole;
      }
    }

    if (
      !application.role
    ) {
      console.error(
        "Glueful: Job role could not be detected. Application was NOT sent.",
        application
      );

      applicationSubmitted =
        false;

      return;
    }

    applicationSubmitted =
      true;

    stopConfirmationWatcher();

    console.log(
      "Glueful confirmed application submission:",
      application
    );

    chrome.runtime.sendMessage(
      {
        type:
          "GLUEFUL_CAPTURE_APPLICATION",

        application:
          application
      },
      (response) => {

        if (
          chrome.runtime.lastError
        ) {
          console.error(
            "Glueful extension error:",
            chrome.runtime.lastError.message
          );

          applicationSubmitted =
            false;

          startConfirmationWatcher();

          return;
        }

        console.log(
          "Glueful response:",
          response
        );

        if (
          !response ||
          response.ok === false
        ) {
          applicationSubmitted =
            false;

          console.error(
            "Glueful: application was not captured:",
            response
          );

          startConfirmationWatcher();

          return;
        }

        console.log(
          "Glueful: application successfully captured."
        );

        pendingApplication =
          null;
      }
    );
  }


  function isApplicationConfirmationVisible() {
    const bodyText =
      cleanText(
        document.body?.innerText
      );

    if (!bodyText) {
      return false;
    }

    const sentConfirmation =
      /your application was sent to/i
        .test(bodyText);

    const submittedConfirmation =
      /\bapplication submitted\b/i
        .test(bodyText);

    const successfullySubmitted =
      /\bapplication successfully submitted\b/i
        .test(bodyText);

    return (
      sentConfirmation ||
      submittedConfirmation ||
      successfullySubmitted
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

    if (!document.body) {
      return;
    }

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

    for (
      const timer
      of companyRetryTimers
    ) {
      clearTimeout(timer);
    }

    companyRetryTimers = [];

    console.log(
      "Glueful: confirmation watcher stopped."
    );
  }


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
        cleanText(
          clickable.innerText
        );

      const ariaLabel =
        cleanText(
          clickable.getAttribute(
            "aria-label"
          )
        );

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
          text,
          ariaLabel,
          tagName:
            clickable.tagName,
          href:
            clickable.getAttribute(
              "href"
            ) || null
        }
      );

      capturePendingApplication();

      startConfirmationWatcher();
    },
    true
  );


  window.gluefulCaptureTest =
    sendApplication;

})();
