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

        return document.title || "";
    }

    /*
     * Send the captured application to the extension
     * background service worker.
     *
     * IMPORTANT:
     * We do NOT try to read the Supabase access token here.
     *
     * This script runs inside LinkedIn/Naukri/Indeed,
     * so localStorage belongs to that website.
     *
     * The background service worker will handle
     * authentication separately.
     */

    function sendApplication() {
        const application = getPageInfo();

        console.log(
            "Glueful captured application:",
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
                    return;
                }

                console.log(
                    "Glueful response:",
                    response
                );

                if (response && response.ok) {
                    console.log(
                        "Glueful application captured successfully."
                    );
                } else if (response) {
                    console.error(
                        "Glueful capture failed:",
                        response.error
                    );
                }
            }
        );
    }

    /*
     * TEST MODE
     *
     * For now we do NOT automatically submit anything.
     *
     * Open the LinkedIn/Naukri/Indeed console and run:
     *
     *     gluefulCaptureTest()
     *
     * to test application capture.
     */

    window.gluefulCaptureTest = sendApplication;

})();
