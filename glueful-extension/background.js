const GLUEFUL_AUTO_CAPTURE_URL =
"https://xztbhheexianejsvwpva.supabase.co/functions/v1/auto-capture";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN";


async function sendToGlueful(application, accessToken) {
    try {
        if (!accessToken) {
            throw new Error(
                "No Supabase access token was provided by the extension."
            );
        }

        console.log("Glueful: sending application to Supabase");

        const response = await fetch(GLUEFUL_AUTO_CAPTURE_URL, {
            method: "POST",

            headers: {
                "apikey": SUPABASE_PUBLISHABLE_KEY,
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },

            body: JSON.stringify(application)
        });

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

        console.log(
            "Glueful received access token:",
            message.accessToken ? "YES" : "NO"
        );


        sendToGlueful(
            message.application,
            message.accessToken
        )
            .then((result) => {

                sendResponse({
                    ok: true,
                    result: result
                });

            })
            .catch((error) => {

                sendResponse({
                    ok: false,
                    error: error.message
                });

            });


        return true;
    }
);
