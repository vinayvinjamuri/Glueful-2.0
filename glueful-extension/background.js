const GLUEFUL_AUTO_CAPTURE_URL =
    "https://xztbhheexianejsvwpva.supabase.co/functions/v1/auto-capture";

const GLUEFUL_DEVICE_LINK_URL =
    "https://xztbhheexianejsvwpva.supabase.co/functions/v1/dynamic-handler";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN";

const PENDING_APPLICATIONS_KEY =
    "pendingGluefulApplications";

const DEVICE_TOKEN_KEY =
    "gluefulDeviceToken";


function generateDeviceToken() {

    const bytes =
        new Uint8Array(32);

    crypto.getRandomValues(bytes);

    return Array.from(bytes)
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");
}


async function getDeviceToken() {

    const result =
        await chrome.storage.local.get(
            [DEVICE_TOKEN_KEY]
        );

    if (
        result[DEVICE_TOKEN_KEY]
    ) {

        return result[DEVICE_TOKEN_KEY];
    }

    const deviceToken =
        generateDeviceToken();

    await chrome.storage.local.set({
        [DEVICE_TOKEN_KEY]:
            deviceToken
    });

    console.log(
        "Glueful: device token created."
    );

    return deviceToken;
}


async function sendToGlueful(
    application,
    accessToken
) {

    const deviceToken =
        await getDeviceToken();

    const payload = {
        ...application,

        device_token:
            deviceToken
    };

    const headers = {

        "apikey":
            SUPABASE_PUBLISHABLE_KEY,

        "Content-Type":
            "application/json"
    };


    if (accessToken) {

        headers.Authorization =
            `Bearer ${accessToken}`;
    }


    console.log(
        "Glueful: sending application to Supabase...",
        {
            loggedIn:
                Boolean(accessToken),

            deviceToken:
                "AVAILABLE"
        }
    );


    const response =
        await fetch(
            GLUEFUL_AUTO_CAPTURE_URL,
            {
                method: "POST",

                headers:

                    headers,

                body:
                    JSON.stringify(
                        payload
                    )
            }
        );


    const text =
        await response.text();


    let data;


    try {

        data =
            JSON.parse(text);

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


async function linkDevice(
    accessToken
) {

    if (!accessToken) {
        return null;
    }


    const deviceToken =
        await getDeviceToken();


    try {

        const response =
            await fetch(
                GLUEFUL_DEVICE_LINK_URL,
                {
                    method: "POST",

                    headers: {

                        "apikey":
                            SUPABASE_PUBLISHABLE_KEY,

                        "Authorization":
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            device_token:
                                deviceToken,

                            device_name:
                                "Glueful Chrome Extension"

                        })
                }
            );


        const text =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(text);

        } catch {

            data = {
                raw: text
            };
        }


        console.log(
            "Glueful device link status:",
            response.status
        );


        console.log(
            "Glueful device link response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                `Device linking failed: ${text}`
            );
        }


        return data;

    } catch (error) {

        console.error(
            "Glueful device linking error:",
            error
        );

        return null;
    }
}


async function getPendingApplications() {

    const result =
        await chrome.storage.local.get(
            [PENDING_APPLICATIONS_KEY]
        );


    return Array.isArray(
        result[PENDING_APPLICATIONS_KEY]
    )
        ? result[PENDING_APPLICATIONS_KEY]
        : [];
}


async function savePendingApplications(
    applications
) {

    await chrome.storage.local.set({

        [PENDING_APPLICATIONS_KEY]:
            applications

    });
}


async function queueApplication(
    application
) {

    const pending =
        await getPendingApplications();


    const duplicate =
        pending.some(
            item => {

                const sameCompany =
                    String(
                        item.company || ""
                    )
                        .trim()
                        .toLowerCase()
                        ===
                    String(
                        application.company || ""
                    )
                        .trim()
                        .toLowerCase();


                const sameRole =
                    String(
                        item.role || ""
                    )
                        .trim()
                        .toLowerCase()
                        ===
                    String(
                        application.role || ""
                    )
                        .trim()
                        .toLowerCase();


                const sameJobUrl =
                    String(
                        item.job_url || ""
                    )
                        .trim()
                        ===
                    String(
                        application.job_url || ""
                    )
                        .trim();


                return (
                    sameCompany &&
                    sameRole &&
                    sameJobUrl
                );
            }
        );


    if (duplicate) {

        console.log(
            "Glueful: application already exists in local queue."
        );


        return {

            duplicate:
                true,

            queued:
                true

        };
    }


    const queuedApplication = {

        ...application,

        queued_at:
            new Date()
                .toISOString(),

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

        duplicate:
            false,

        queued:
            true

    };
}


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
            "Glueful: no local pending applications to sync."
        );

        return;
    }


    console.log(
        `Glueful: syncing ${pending.length} local pending application(s)...`
    );


    const remaining = [];


    for (
        const application
        of pending
    ) {

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


            if (
                result &&
                result.ok
            ) {

                console.log(
                    "Glueful: queued application synced successfully.",
                    result
                );

                continue;
            }


            remaining.push(
                application
            );

        } catch (error) {

            console.error(
                "Glueful: queued application sync failed:",
                error
            );


            remaining.push(
                application
            );
        }
    }


    await savePendingApplications(
        remaining
    );


    console.log(
        `Glueful: local queue sync complete. ${remaining.length} application(s) remaining.`
    );
}


chrome.runtime.onMessage.addListener(
    (
        message,
        sender,
        sendResponse
    ) => {

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
            async result => {

                const accessToken =
                    result.supabaseAccessToken;


                console.log(
                    "Glueful stored access token:",
                    accessToken
                        ? "YES"
                        : "NO"
                );


                try {

                    const result =
                        await sendToGlueful(
                            message.application,
                            accessToken
                        );


                    if (
                        result &&
                        result.ok
                    ) {

                        sendResponse({

                            ok:
                                true,

                            queued:
                                result.queued
                                === true,

                            synced:
                                result.synced
                                === true,

                            duplicate:
                                result.duplicate
                                === true,

                            result:
                                result

                        });

                        return;
                    }


                    throw new Error(
                        "Supabase did not confirm the application."
                    );


                } catch (error) {

                    console.error(
                        "Glueful: application send failed:",
                        error
                    );


                    try {

                        const queueResult =
                            await queueApplication(
                                message.application
                            );


                        sendResponse({

                            ok:
                                true,

                            queued:
                                true,

                            synced:
                                false,

                            localFallback:
                                true,

                            duplicate:
                                queueResult.duplicate,

                            result:
                                queueResult

                        });


                    } catch (queueError) {

                        console.error(
                            "Glueful: local queue failed:",
                            queueError
                        );


                        sendResponse({

                            ok:
                                false,

                            queued:
                                false,

                            synced:
                                false,

                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error)

                        });
                    }
                }

            }
        );


        return true;
    }
);


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

                ok:
                    false,

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

                ok:
                    false,

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

                        ok:
                            false,

                        error:
                            chrome.runtime.lastError.message

                    });


                    return;
                }


                console.log(
                    "Glueful: Supabase access token stored successfully."
                );


                try {

                    const deviceResult =
                        await linkDevice(
                            accessToken
                        );


                    console.log(
                        "Glueful: device linking completed:",
                        deviceResult
                    );


                    await syncPendingApplications(
                        accessToken
                    );


                    sendResponse({

                        ok:
                            true,

                        deviceLinked:
                            Boolean(
                                deviceResult &&
                                deviceResult.ok
                            ),

                        syncedPending:
                            true

                    });


                } catch (error) {

                    console.error(
                        "Glueful: login synchronization failed:",
                        error
                    );


                    sendResponse({

                        ok:
                            true,

                        deviceLinked:
                            false,

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


chrome.runtime.onStartup.addListener(
    async () => {

        console.log(
            "Glueful: extension startup detected."
        );


        await getDeviceToken();


        const result =
            await chrome.storage.local.get(
                ["supabaseAccessToken"]
            );


        if (
            result.supabaseAccessToken
        ) {

            await linkDevice(
                result.supabaseAccessToken
            );


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


chrome.runtime.onInstalled.addListener(
    async () => {

        console.log(
            "Glueful: extension installed/updated."
        );


        await getDeviceToken();


        const result =
            await chrome.storage.local.get(
                ["supabaseAccessToken"]
            );


        if (
            result.supabaseAccessToken
        ) {

            await linkDevice(
                result.supabaseAccessToken
            );


            await syncPendingApplications(
                result.supabaseAccessToken
            );
        }
    }
);
