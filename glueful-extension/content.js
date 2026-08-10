(function () {
  "use strict";

  console.log("Glueful Auto Capture loaded");

  let applicationSubmitted = false;
  let confirmationObserver = null;
  let confirmationCheckTimer = null;

  /*
   * IMPORTANT:
   *
   * We save the job information when the user clicks
   * Apply/Easy Apply.
   *
   * LinkedIn may change/remove the job information from
   * the DOM after the confirmation screen appears.
   */
  let pendingApplication = null;


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
   */

  function detectCompany() {

    /*
     * ----------------------------------------------------------
     * LinkedIn-specific selectors
     * ----------------------------------------------------------
     */

    if (
      window.location.hostname.includes("linkedin.com")
    ) {

      const linkedinSelectors = [

        ".job-details-jobs-unified-top-card__company-name a",

        ".job-details-jobs-unified-top-card__company-name",

        ".jobs-unified-top-card__company-name a",

        ".jobs-unified-top-card__company-name",

        '[data-testid="company-name"]'
      ];


      for (const selector of linkedinSelectors) {

        try {

          const elements =
            document.querySelectorAll(selector);

          for (const element of elements) {

            const text =
              (
                element.innerText ||
                element.textContent ||
                ""
              ).trim();

            if (
              text &&
              !looksLikeLocation(text)
            ) {

              return cleanText(text);
            }
          }

        } catch (error) {

          console.warn(
            "Glueful company selector failed:",
            selector,
            error
          );
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

      try {

        const elements =
          document.querySelectorAll(selector);

        for (const element of elements) {

          const text =
            (
              element.innerText ||
              element.textContent ||
              ""
            ).trim();

          if (
            text &&
            !looksLikeLocation(text)
          ) {

            return cleanText(text);
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


    /*
     * ----------------------------------------------------------
     * Page title fallback
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

        try {

          const elements =
            document.querySelectorAll(selector);

          for (const element of elements) {

            const text =
              (
                element.innerText ||
                element.textContent ||
                ""
              ).trim();

            if (text) {

              return cleanText(text);
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


    for (const selector of selectors) {

      try {

        const elements =
          document.querySelectorAll(selector);

        for (const element of elements) {

          const text =
            (
              element.innerText ||
              element.textContent ||
              ""
            ).trim();

          if (text) {

            return cleanText(text);
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

        try {

          const elements =
            document.querySelectorAll(selector);

          for (const element of elements) {

            const text =
              (
                element.innerText ||
                element.textContent ||
                ""
              ).trim();

            if (!text) {
              continue;
            }


            /*
             * LinkedIn may display:
             *
             * Company Name · Hyderabad, Telangana, India
             *
             * Hyderabad, Telangana, India · 1 day ago
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
   * SAVE PENDING APPLICATION
   * ============================================================
   *
   * Called immediately when Apply/Easy Apply is clicked.
   */

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


    /*
     * Sometimes LinkedIn finishes rendering the company
     * slightly after the Apply button is clicked.
     *
     * Try again shortly if company is missing.
     */

    if (!pendingApplication.company) {

      setTimeout(() => {

        if (
          pendingApplication &&
          !pendingApplication.company &&
          !applicationSubmitted
        ) {

          const company =
            detectCompany();


          if (company) {

            pendingApplication.company =
              company;


            console.log(
              "Glueful: company detected on delayed check:",
              company
            );
          }
        }

      }, 300);
    }


    /*
     * Second delayed attempt.
     */

    if (!pendingApplication.company) {

      setTimeout(() => {

        if (
          pendingApplication &&
          !pendingApplication.company &&
          !applicationSubmitted
        ) {

          const company =
            detectCompany();


          if (company) {

            pendingApplication.company =
              company;


            console.log(
              "Glueful: company detected on second delayed check:",
              company
            );
          }
        }

      }, 1000);
    }
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


    /*
     * ----------------------------------------------------------
     * IMPORTANT FIX
     * ----------------------------------------------------------
     *
     * Use the information captured when Apply was clicked.
     *
     * DO NOT depend on the confirmation screen for company.
     */

    let application;


    if (pendingApplication) {

      application = {
        ...pendingApplication,

        /*
         * Actual confirmation/submission time.
         */
        applied_at:
          new Date().toISOString(),

        status:
          "applied"
      };

    } else {

      /*
       * Fallback.
       */
      application =
        getPageInfo();
    }


    /*
     * ----------------------------------------------------------
     * FINAL SAFETY CHECK
     * ----------------------------------------------------------
     *
     * Never send an application with an empty company.
     */

    if (!application.company) {

      console.error(
        "Glueful: Company could not be detected. Application was NOT sent.",
        application
      );


      /*
       * Try one final detection.
       */

      const retryCompany =
        detectCompany();


      if (retryCompany) {

        application.company =
          retryCompany;


        console.log(
          "Glueful: final company retry succeeded:",
          retryCompany
        );

      } else {

        /*
         * Keep watcher alive so another DOM mutation
         * can trigger another check.
         */

        applicationSubmitted = false;

        return;
      }
    }


    /*
     * Role is also required by Supabase.
     */

    if (!application.role) {

      console.error(
        "Glueful: Job role could not be detected. Application was NOT sent.",
        application
      );


      applicationSubmitted = false;

      return;
    }


    /*
     * Mark as submitted only AFTER validation succeeds.
     */

    applicationSubmitted = true;


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

        if (chrome.runtime.lastError) {

          console.error(
            "Glueful extension error:",
            chrome.runtime.lastError.message
          );


          /*
           * Allow another attempt.
           */

          applicationSubmitted = false;

          return;
        }


        console.log(
          "Glueful response:",
          response
        );


        /*
         * If Supabase returned an error,
         * allow another attempt.
         */

        if (
          !response ||
          response.ok === false
        ) {

          applicationSubmitted = false;


          console.error(
            "Glueful: application was not captured:",
            response
          );


          /*
           * Restart confirmation watcher.
           */

          startConfirmationWatcher();

          return;
        }


        /*
         * SUCCESS
         */

        console.log(
          "Glueful: application successfully captured."
        );


        /*
         * Clear pending data after success.
         */

        pendingApplication = null;
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


    /*
     * Strong LinkedIn confirmation:
     *
     * "Your application was sent to ..."
     */

    const sentConfirmation =
      /your application was sent to/i
        .test(bodyText);


    /*
     * Secondary confirmation:
     *
     * "Application submitted"
     */

    const submittedConfirmation =
      /\bapplication submitted\b/i
        .test(bodyText);


    return (
      sentConfirmation ||
      submittedConfirmation
    );
  }


  /*
   * ============================================================
   * CHECK CONFIRMATION
   * ============================================================
   */

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


  /*
   * ============================================================
   * START CONFIRMATION WATCHER
   * ============================================================
   */

  function startConfirmationWatcher() {

    /*
     * Don't create multiple observers.
     */

    if (confirmationObserver) {
      return;
    }


    console.log(
      "Glueful: watching for LinkedIn application confirmation..."
    );


    /*
     * Check immediately.
     */

    checkForApplicationConfirmation();


    /*
     * Watch LinkedIn React DOM changes.
     */

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


    if (document.body) {

      confirmationObserver.observe(
        document.body,
        {
          childList: true,

          subtree: true,

          characterData: true
        }
      );
    }
  }


  /*
   * ============================================================
   * STOP CONFIRMATION WATCHER
   * ============================================================
   */

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


      /*
       * Find the actual clickable element.
       */

      const clickable =
        target.closest(
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
       * Button text.
       */

      const text =
        (
          clickable.innerText ||
          ""
        ).trim();


      /*
       * aria-label.
       */

      const ariaLabel =
        (
          clickable.getAttribute(
            "aria-label"
          ) || ""
        ).trim();


      /*
       * Recognize:
       *
       * Apply
       * Easy Apply
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
       * ========================================================
       * APPLY DETECTED
       * ========================================================
       */

      console.log(
        "Glueful Apply button detected:",
        {
          text:
            text,

          ariaLabel:
            ariaLabel,

          tagName:
            clickable.tagName,

          href:
            clickable.getAttribute(
              "href"
            ) || null
        }
      );


      /*
       * IMPORTANT:
       *
       * Save company/role/location BEFORE waiting
       * for LinkedIn confirmation.
       */

      capturePendingApplication();


      /*
       * Now start watching for successful submission.
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
   * Run from browser console:
   *
   * gluefulCaptureTest()
   */

  window.gluefulCaptureTest =
    sendApplication;

})();
