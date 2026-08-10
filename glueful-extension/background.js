const GLUEFUL_AUTO_CAPTURE_URL =
    "https://xztbhheexianejsvwpva.supabase.co/functions/v1/auto-capture";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN";

const PENDING_APPLICATIONS_KEY =
    "pendingGluefulApplications";


/*
 * ============================================================
 * SEND APPLICATION TO SUPABASE
 * ============================================================
 */

async function sendToGlueful(application, accessToken) {

    if (!accessToken) {
        throw new Error(
            "No Supabase access token available."
        );
    }

    console.log(
        "Glueful: sending application to Supabase..."
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
        throw new Error(
            `Supabase returned ${response.status}: ${text}`
        );
    }

    return data;
}


/*
 * ============================================================
 * LOCAL QUEUE
 * ============================================================
 *
 * Applications are stored locally when the user is not
 * logged into Glueful.
 *
 * chrome.storage.local is intentionally used instead of
 * chrome.storage.session because the queue must survive:
 *
 * - browser restart
 * - extension reload
 * - computer restart
 * - LinkedIn tab closing
 *
 */

async function getPendingApplications() {

    const result =
        await chrome.storage.local.get(
            [PENDING_APPLICATIONS_KEY]
        );

    return (
        result[PENDING_APPLICATIONS_KEY] || []
    );
}


async function savePendingApplications(
    applications
) {

    await chrome.storage.local.set({
        [PENDING_APPLICATIONS_KEY]:
            applications
    });
}


/*
 * ============================================================
 * CREATE LOCAL QUEUE ENTRY
 * ============================================================
 */

async function queueApplication(
    application
) {

    const pending =
        await getPendingApplications();

    /*
     * Prevent the same application from being
     * queued repeatedly.
     */

    const duplicate =
        pending.some((item) => {

            const sameCompany =
                String(item.company || "")
                    .trim()
                    .toLowerCase() ===
                String(application.company || "")
                    .trim()
                    .toLowerCase();

            const sameRole =
                String(item.role || "")
                    .trim()
                    .toLowerCase() ===
                String(application.role || "")
                    .trim()
                    .toLowerCase();

            const sameJobUrl =
                String(item.job_url || "") ===
                String(application.job_url || "");

            return (
                sameCompany &&
                sameRole &&
                sameJobUrl
            );
        });

    if (duplicate) {

        console.log(
            "Glueful: application already exists in local queue."
        );

        return {
            duplicate: true,
            queued: true
        };
    }


    const queuedApplication = {

        ...application,

        queued_at:
            new Date().toISOString(),

        queue_status:
            "pending"
    };


    pending.push(
        queuedApplication
    );


    await savePendingApplications(
        pending
    );


    console.log(
        "Glueful: application saved to local queue.",
        queuedApplication
    );


    return {
        duplicate: false,
        queued: true
    };
}


/*
 * ============================================================
 * SYNC PENDING APPLICATIONS
 * ============================================================
 */

async function syncPendingApplications(
    accessToken
) {

    if (!accessToken) {

        console.log(
            "Glueful: no login session. Pending applications remain queued."
        );

        return;
    }


    const pending =
        await getPendingApplications();


    if (!pending.length) {

        console.log(
            "Glueful: no pending applications to sync."
        );

        return;
    }


    console.log(
        `Glueful: syncing ${pending.length} pending application(s)...`
    );


    const remaining = [];


    for (const application of pending) {

        try {

            console.log(
                "Glueful: syncing queued application:",
                application
            );


            const result =
                await sendToGlueful(
                    application,
                    accessToken
                );


            console.log(
                "Glueful: queued application synced successfully.",
                result
            );


            /*
             * Do NOT put this application back into
             * the queue because Supabase accepted it.
             */

        } catch (error) {

            console.error(
                "Glueful: queued application sync failed:",
                error
            );


            /*
             * Keep failed applications in the queue.
             *
             * They will be retried the next time the user
             * logs in / the extension starts.
             */

            remaining.push(
                application
            );
        }
    }


    await savePendingApplications(
        remaining
    );


    console.log(
        `Glueful: queue sync complete. ${remaining.length} application(s) remaining.`
    );
}


/*
 * ============================================================
 * CAPTURE APPLICATION MESSAGE
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


        console.log(
            "Glueful received application:",
            message.application
        );


        chrome.storage.local.get(
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
                 * =================================================
                 * NO LOGIN SESSION
                 * =================================================
                 *
                 * IMPORTANT:
                 *
                 * We DO NOT reject the application anymore.
                 *
                 * Instead we save it locally.
                 */

                if (!accessToken) {

                    try {

                        const queueResult =
                            await queueApplication(
                                message.application
                            );


                        console.log(
                            "Glueful: application queued because user is not logged in."
                        );


                        sendResponse({

                            ok: true,

                            queued: true,

                            synced: false,

                            duplicate:
                                queueResult.duplicate,

                            message:
                                "Application captured and saved locally. It will sync when you sign in to Glueful."

                        });

                    } catch (error) {

                        console.error(
                            "Glueful: failed to queue application:",
                            error
                        );


                        sendResponse({

                            ok: false,

                            queued: false,

                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error)

                        });
                    }


                    return;
                }


                /*
                 * =================================================
                 * USER IS LOGGED IN
                 * =================================================
                 *
                 * Existing functionality continues normally.
                 */

                try {

                    const result =
                        await sendToGlueful(
                            message.application,
                            accessToken
                        );


                    sendResponse({

                        ok: true,

                        queued: false,

                        synced: true,

                        result:
                            result

                    });


                } catch (error) {

                    console.error(
                        "Glueful: application sync failed:",
                        error
                    );


                    /*
                     * If Supabase temporarily fails,
                     * don't lose the application.
                     */

                    try {

                        await queueApplication(
                            message.application
                        );

                    } catch (queueError) {

                        console.error(
                            "Glueful: could not queue failed application:",
                            queueError
                        );
                    }


                    sendResponse({

                        ok: false,

                        queued: true,

                        synced: false,

                        error:
                            error instanceof Error
                                ? error.message
                                : String(error)

                    });
                }

            }
        );


        /*
         * Required because we respond asynchronously.
         */

        return true;
    }
);


/*
 * ============================================================
 * GLUEFUL AUTH MESSAGE
 * ============================================================
 *
 * Glueful website sends the Supabase access token here after
 * the user signs in.
 *
 * We store the token and immediately attempt to sync all
 * applications captured while the user was logged out.
 *
 */

chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {

        console.log(
            "Glueful external message received:",
            message
        );


        /*
         * Only allow messages from the official
         * Glueful GitHub Pages application.
         */

        if (
            !sender.url ||
            !sender.url.startsWith(
                "https://vinayvinjamuri.github.io/Glueful-2.0/"
            )
        ) {

            console.warn(
                "Glueful: rejected external message from:",
                sender.url
            );


            sendResponse({

                ok: false,

                error:
                    "Unauthorized sender"

            });


            return;
        }


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


        chrome.storage.local.set(
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
                    "Glueful: Supabase access token stored successfully."
                );


                /*
                 * =================================================
                 * AUTOMATIC QUEUE SYNC
                 * =================================================
                 */

                try {

                    await syncPendingApplications(
                        accessToken
                    );


                    sendResponse({

                        ok: true,

                        syncedPending:
                            true

                    });

                } catch (error) {

                    console.error(
                        "Glueful: pending queue sync failed:",
                        error
                    );


                    sendResponse({

                        ok: true,

                        syncedPending:
                            false,

                        warning:
                            error instanceof Error
                                ? error.message
                                : String(error)

                    });
                }

            }
        );


        return true;
    }
);


/*
 * ============================================================
 * EXTENSION STARTUP
 * ============================================================
 *
 * If the extension starts and the user is already logged in,
 * attempt to sync any applications that are still queued.
 *
 */

chrome.runtime.onStartup.addListener(
    async () => {

        console.log(
            "Glueful: extension startup detected."
        );


        const result =
            await chrome.storage.local.get(
                ["supabaseAccessToken"]
            );


        if (
            result.supabaseAccessToken
        ) {

            await syncPendingApplications(
                result.supabaseAccessToken
            );

        } else {

            console.log(
                "Glueful: no active login session at startup."
            );
        }
    }
);


/*
 * ============================================================
 * EXTENSION INSTALLED / UPDATED
 * ============================================================
 */

chrome.runtime.onInstalled.addListener(
    async () => {

        console.log(
            "Glueful: extension installed/updated."
        );


        const result =
            await chrome.storage.local.get(
                ["supabaseAccessToken"]
            );


        if (
            result.supabaseAccessToken
        ) {

            await syncPendingApplications(
                result.supabaseAccessToken
            );
        }
    }
);
