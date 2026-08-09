const GLUEFUL_AUTO_CAPTURE_URL =
  "https://xztbhheexianesjsvwvpa.supabase.co/functions/v1/auto-capture";

async function sendToGlueful(application) {
  try {
    const response = await fetch(GLUEFUL_AUTO_CAPTURE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(application)
    });

    const data = await response.json();

    console.log("Glueful auto-capture response:", data);

    return data;
  } catch (error) {
    console.error("Glueful auto-capture error:", error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "GLUEFUL_CAPTURE_APPLICATION") {
    return;
  }

  sendToGlueful(message.application)
    .then((result) => {
      sendResponse({
        ok: true,
        result
      });
    })
    .catch((error) => {
      sendResponse({
        ok: false,
        error: error.message
      });
    });

  return true;
});
