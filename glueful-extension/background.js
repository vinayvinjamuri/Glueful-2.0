const GLUEFUL_AUTO_CAPTURE_URL =
    "https://xztbhheexianejsvwpva.supabase.co/functions/v1/auto-capture";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN";

const PENDING_APPLICATIONS_KEY =
    "pendingApplications";


/*
 * ============================================================
 * SEND APPLICATION TO GLUEFUL
 * ============================================================
 */

async function sendToGlueful(application, accessToken) {

    if (!accessToken) {
        throw new Error(
            "No Supabase access token is available."
        );
    }

    console.log(
        "Glueful: sending application to Supabase"
    );

    const response = await fetch(
        GLUEFUL_AUTO_CAPTURE_URL,
        {
            method: "POST",

            headers: {
                "apikey": SUPABASE_PUBLISHABLE_KEY,
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },

            body: JSON.stringify(application)
        }
    );

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        data = {
            raw: text
        };
    }

    console.log(
        "Glueful auto-capture HTTP status:",
        response.status
    );

    console.log(
        "Glueful auto-capture response:",
        data
    );

    if (!response.ok) {

        const error = new Error(
            `Supabase returned ${response.status}: ${text}`
        );

        error.status = response.status;

        throw error;
    }

    return data;
}


/*
 * ============================================================
 * CREATE A LOCAL ID FOR A PENDING APPLICATION
 * ============================================================
 *
 * This is only used by the extension's local queue.
 *
 * It prevents the same application from being stored
 * repeatedly while the user is logged out.
 */

function createPendingApplicationKey(application) {

    const company =
        String(application.company || "")
            .trim()
            .toLowerCase();

    const role =
        String(application.role || "")
            .trim()
            .toLowerCase();

    const jobUrl =
        String(application.job_url || "")
            .trim()
            .toLowerCase();

    const source =
        String(application.source_name || "")
            .trim()
            .toLowerCase();

    const appliedAt =
        String(application.applied_at || "")
            .trim()
            .slice(0, 10);

    return [
        company,
        role,
        jobUrl,
        source,
        appliedAt
    ].join("|");
}


/*
 * ============================================================
 * GET PENDING APPLICATIONS
 * ============================================================
 */

async function getPendingApplications() {

    const result =
        await chrome.storage.local.get(
            [PENDING_APPLICATIONS_KEY]
        );

    return (
        Array.isArray(
            result[PENDING_APPLICATIONS_KEY]
        )
            ? result[PENDING_APPLICATIONS_KEY]
            : []
    );
}


/*
 * ============================================================
 * SAVE APPLICATION TO LOCAL QUEUE
 * ============================================================
 *
 * IMPORTANT:
 *
 * This uses chrome.storage.local, NOT storage.session.
 *
 * Therefore pending applications survive:
 *
 * - extension reload
 * - browser restart
 * - computer restart
 *
 * until they are successfully synchronized.
 */

async function queueApplication(application) {

    const pendingApplications =
        await getPendingApplications();

    const key =
        createPendingApplicationKey(
            application
        );

    const alreadyPending =
        pendingApplications.some(
            (item) =>
                item.key === key
        );

    if (alreadyPending) {

        console.log(
            "Glueful: application is already in pending queue."
        );

        return {
            queued: true,
            duplicate: true,
            key: key
        };
    }

    pendingApplications.push({
        key: key,

        application: application,

        queuedAt:
            new Date().toISOString()
    });

    await chrome.storage.local.set({
        [PENDING_APPLICATIONS_KEY]:
            pendingApplications
    });

    console.log(
        "Glueful: application saved to local pending queue."
    );

    console.log(
        "Glueful pending applications:",
        pendingApplications.length
    );

    return {
        queued: true,
        duplicate: false,
        key: key
    };
}


/*
 * ============================================================
 * REMOVE APPLICATION FROM LOCAL QUEUE
 * ============================================================
 */

async function removePendingApplication(key) {

    const pendingApplications =
        await getPendingApplications();

    const remaining =
        pendingApplications.filter(
            (item) =>
                item.key !== key
        );

    await chrome.storage.local.set({
        [PENDING_APPLICATIONS_KEY]:
            remaining
    });

    console.log(
        "Glueful: removed application from pending queue.",
        key
    );
}


/*
 * ============================================================
 * SYNC PENDING APPLICATIONS
 * ============================================================
 *
 * Called when:
 *
 * 1. User logs into Glueful
 * 2. Extension receives a valid access token
 *
 * Every pending application is attempted.
 *
 * Successful applications are removed.
 *
 * Failed applications remain in the queue.
 */

async function syncPendingApplications(
    accessToken
) {

    if (!accessToken) {

        console.log(
            "Glueful: cannot sync pending applications because no access token exists."
        );

        return;
    }

    const pendingApplications =
        await getPendingApplications();

    if (
        pendingApplications.length === 0
    ) {

        console.log(
            "Glueful: no pending applications to sync."
        );

        return;
    }

    console.log(
        `Glueful: attempting to sync ${pendingApplications.length} pending application(s).`
    );


    for (
        const item of pendingApplications
    ) {

        if (
            !item ||
            !item.application
        ) {
            continue;
        }

        try {

            console.log(
                "Glueful: syncing pending application:",
                item.application
            );

            const result =
                await sendToGlueful(
                    item.application,
                    accessToken
                );

            /*
             * IMPORTANT:
             *
             * A successful response includes both:
             *
             * - newly created application
             * - duplicate application
             *
             * Both mean the application has been
             * successfully handled by Glueful.
             *
             * Therefore we remove it from the queue.
             */

            await removePendingApplication(
                item.key
            );

            console.log(
                "Glueful: pending application synchronized successfully.",
                result
            );

        } catch (error) {

            console.error(
                "Glueful: pending application sync failed:",
                error
            );

            /*
             * If authentication expired, stop immediately.
             *
             * Keep the application in the queue.
             */

            if (
                error &&
                error.status === 401
            ) {

                console.warn(
                    "Glueful: authentication expired. Keeping remaining applications pending."
                );

                break;
            }

            /*
             * For network/server errors:
             *
             * Keep the application in the queue.
             *
             * We do NOT delete it.
             */

            console.warn(
                "Glueful: keeping application in pending queue for a later retry."
            );
        }
    }


    const remaining =
        await getPendingApplications();

    console.log(
        `Glueful: pending queue now contains ${remaining.length} application(s).`
    );
}


/*
 * ============================================================
 * RECEIVE APPLICATION FROM CONTENT.JS
 * ============================================================
 */

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (
            !message ||
            message.type !==
                "GLUEFUL_CAPTURE_APPLICATION"
        ) {
            return;
        }

        const application =
            message.application;

        console.log(
            "Glueful received application:",
            application
        );


        /*
         * ------------------------------------------------------
         * GET CURRENT AUTH SESSION
         * ------------------------------------------------------
         */

        chrome.storage.session.get(
            ["supabaseAccessToken"],
            async (result) => {

                const accessToken =
                    result.supabaseAccessToken;

                console.log(
                    "Glueful stored access token:",
                    accessToken
                        ? "YES"
                        : "NO"
                );


                /*
                 * ------------------------------------------------
                 * NO LOGIN SESSION
                 * ------------------------------------------------
                 *
                 * THIS IS THE IMPORTANT CHANGE.
                 *
                 * We DO NOT reject the application.
                 *
                 * We save it locally.
                 */

                if (!accessToken) {

                    try {

                        const queueResult =
                            await queueApplication(
                                application
                            );

                        sendResponse({
                            ok: true,

                            queued: true,

                            synced: false,

                            message:
                                "Application captured and saved locally. It will sync when you sign in to Glueful.",

                            result:
                                queueResult
                        });

                    } catch (error) {

                        console.error(
                            "Glueful: failed to save application locally:",
                            error
                        );

                        sendResponse({
                            ok: false,

                            queued: false,

                            error:
                                error instanceof Error
                                    ? error.message
                                    : "Failed to save application locally."
                        });
                    }

                    return;
                }


                /*
                 * ------------------------------------------------
                 * LOGIN SESSION EXISTS
                 * ------------------------------------------------
                 */

                try {

                    const result =
                        await sendToGlueful(
                            application,
                            accessToken
                        );

                    sendResponse({
                        ok: true,

                        queued: false,

                        synced: true,

                        result: result
                    });

                } catch (error) {

                    console.error(
                        "Glueful: immediate application sync failed:",
                        error
                    );


                    /*
                     * If the request failed because of
                     * network/server/auth problems, don't
                     * lose the application.
                     *
                     * Save it locally for later retry.
                     */

                    try {

                        await queueApplication(
                            application
                        );

                    } catch (queueError) {

                        console.error(
                            "Glueful: failed to queue application after sync failure:",
                            queueError
                        );
                    }


                    sendResponse({
                        ok: true,

                        queued: true,

                        synced: false,

                        message:
                            "Application captured and saved locally. It will be synchronized later.",

                        error:
                            error instanceof Error
                                ? error.message
                                : "Application sync failed."
                    });
                }

            }
        );


        /*
         * IMPORTANT:
         *
         * We respond asynchronously.
         */

        return true;
    }
);


/*
 * ============================================================
 * RECEIVE GLUEFUL LOGIN
 * ============================================================
 *
 * Glueful website sends the user's Supabase access token
 * to the extension.
 *
 * We store it in session storage and immediately synchronize
 * anything captured while the user was logged out.
 */

chrome.runtime.onMessageExternal.addListener(
    (
        message,
        sender,
        sendResponse
    ) => {

        console.log(
            "Glueful external message received:",
            message
        );


        /*
         * ------------------------------------------------------
         * SECURITY CHECK
         * ------------------------------------------------------
         */

        if (
            !sender.url ||
            !sender.url.startsWith(
                "https://vinayvinjamuri.github.io/Glueful-2.0/"
            )
        ) {

            console.warn(
                "Rejected external message from:",
                sender.url
            );

            sendResponse({
                ok: false,
                error:
                    "Unauthorized sender"
            });

            return;
        }


        /*
         * ------------------------------------------------------
         * ONLY ACCEPT AUTH MESSAGE
         * ------------------------------------------------------
         */

        if (
            !message ||
            message.type !==
                "GLUEFUL_AUTH"
        ) {
            return;
        }


        const accessToken =
            message.accessToken;


        if (!accessToken) {

            console.error(
                "Glueful auth message contained no access token."
            );

            sendResponse({
                ok: false,
                error:
                    "No access token received."
            });

            return;
        }


        /*
         * ------------------------------------------------------
         * STORE LOGIN SESSION
         * ------------------------------------------------------
         */

        chrome.storage.session.set(
            {
                supabaseAccessToken:
                    accessToken
            },
            async () => {

                if (
                    chrome.runtime.lastError
                ) {

                    console.error(
                        "Could not store Supabase access token:",
                        chrome.runtime.lastError.message
                    );

                    sendResponse({
                        ok: false,
                        error:
                            chrome.runtime.lastError.message
                    });

                    return;
                }


                console.log(
                    "Glueful Supabase access token stored successfully."
                );


                /*
                 * ------------------------------------------------
                 * IMPORTANT:
                 *
                 * USER JUST LOGGED IN.
                 *
                 * NOW SYNCHRONIZE EVERYTHING THAT WAS CAPTURED
                 * WHILE LOGGED OUT.
                 * ------------------------------------------------
                 */

                try {

                    await syncPendingApplications(
                        accessToken
                    );

                    sendResponse({
                        ok: true,

                        message:
                            "Glueful login stored and pending applications synchronized."
                    });

                } catch (error) {

                    console.error(
                        "Glueful: pending application synchronization failed:",
                        error
                    );

                    /*
                     * Login itself succeeded even if synchronization
                     * had a temporary problem.
                     */

                    sendResponse({
                        ok: true,

                        warning:
                            "Login succeeded, but some pending applications could not be synchronized yet."
                    });
                }

            }
        );


        return true;
    }
);
