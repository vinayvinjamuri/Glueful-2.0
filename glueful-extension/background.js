const GLUEFUL_AUTO_CAPTURE_URL =
  "https://xztbhheexianejsvwpva.supabase.co/functions/v1/auto-capture";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN";

async function sendToGlueful(application) {
  try {
    const response = await fetch(GLUEFUL_AUTO_CAPTURE_URL, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(application)
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    console.log("Glueful auto-capture response:", data);

    if (!response.ok) {
      throw new Error(
        `Supabase returned ${response.status}: ${text}`
      );
    }

    return data;

  } catch (error) {
    console.error("Glueful auto-capture error:", error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {

    if (message?.type !== "GLUEFUL_CAPTURE_APPLICATION") {
      return;
    }

    console.log(
      "Glueful received application:",
      message.application
    );

    sendToGlueful(message.application)
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
