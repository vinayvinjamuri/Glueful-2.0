const GLUEFUL_AUTO_CAPTURE_URL =
    "https://xztbhheexianejsvwpva.supabase.co/functions/v1/auto-capture";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN";


/*
 * ============================================================
 * SEND APPLICATION TO GLUEFUL
 * ============================================================
 */

async function sendToGlueful(application, accessToken) {

    try {

        if (!accessToken) {
            throw new Error(
                "No Supabase access token is available. Please sign in to Glueful first."
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
            throw new Error(
                `Supabase returned ${response.status}: ${text}`
            );
        }

        return data;

    } catch (error) {

        console.error(
            "Glueful auto-capture error:",
            error
        );

        throw error;
    }
}


/*
 * ============================================================
 * RECEIVE APPLICATION FROM CONTENT SCRIPT
 * ============================================================
 */

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (
            !message ||
            message.type !== "GLUEFUL_CAPTURE_APPLICATION"
        ) {
            return;
        }

        console.log(
            "Glueful received application:",
            message.application
        );


        /*
         * Get the Supabase access token from extension storage.
         *
         * content.js no longer handles authentication.
         */

        chrome.storage.session.get(
            ["supabaseAccessToken"],
            async (result) => {

                const accessToken =
                    result.supabaseAccessToken;


                console.log(
                    "Glueful stored access token:",
                    accessToken ? "YES" : "NO"
                );


                if (!accessToken) {

                    sendResponse({
                        ok: false,
                        error:
                            "No Glueful login session found. Please sign in to Glueful first."
                    });

                    return;
                }


                try {

                    const result =
                        await sendToGlueful(
                            message.application,
                            accessToken
                        );


                    sendResponse({
                        ok: true,
                        result: result
                    });

                } catch (error) {

                    sendResponse({
                        ok: false,
                        error: error.message
                    });

                }

            }
        );


        /*
         * We respond asynchronously.
         */

        return true;
    }
);


/*
 * ============================================================
 * RECEIVE AUTHENTICATION FROM GLUEFUL WEBSITE
 * ============================================================
 *
 * The Glueful website will send the user's current
 * Supabase access token to the extension.
 */

chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {

        console.log(
            "Glueful external message received:",
            message
        );


        /*
         * Security check:
         * Only accept authentication messages from
         * our Glueful website.
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
                error: "Unauthorized sender"
            });

            return;
        }


        if (
            !message ||
            message.type !== "GLUEFUL_AUTH"
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
                error: "No access token received."
            });

            return;
        }


        /*
         * Store the access token in extension session storage.
         */

        chrome.storage.session.set(
            {
                supabaseAccessToken: accessToken
            },
            () => {

                if (chrome.runtime.lastError) {

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


                sendResponse({
                    ok: true
                });

            }
        );


        return true;
    }
);
