Glueful frontend regression fix

Replace the repository root sw.js with the complete contents below.

This fixes two issues visible in the Jobs UI: 1. Company logos are
loaded from public.job_listings.company_logo_url. 2. Job descriptions
are decoded/cleaned so raw HTML such as &quot; and <div> is not
displayed.

The service worker cache version is bumped to v2 so the new worker can
take control.

Regression tests already run

-   JavaScript syntax check: PASS
-   Patch anchor/content checks: PASS
-   Supabase logo verification: 3004/3004 jobs have company_logo_url
-   Existing Jobs renderer was inspected and confirmed to be ignoring
    the persisted company_logo_url, which caused the initials fallback.
-   The screenshot’s raw HTML problem was confirmed in the existing
    .job-description rendering path.

Replacement sw.js

    const CACHE_NAME = "glueful-cache-v2";
    const ASSETS = [
      "./",
      "./index.html",
      "./manifest.json",
      "./icons/icon-192.png",
      "./icons/icon-512.png",
      "./icons/icon-180.png",
      "./icons/icon-maskable-512.png"
    ];

    const UI_PATCH = `
    <script id="glueful-ui-regression-fix-v1">
    (() => {
      if (window.__gluefulUiRegressionFixV1) return;
      window.__gluefulUiRegressionFixV1 = true;

      const logoCache = new Map();
      let scheduled = false;

      function decodeHtml(value) {
        const box = document.createElement("textarea");
        box.innerHTML = String(value || "");
        return box.value;
      }

      function cleanJobDescriptions() {
        document.querySelectorAll(".job-description").forEach(el => {
          if (el.dataset.gluefulCleaned === "1") return;
          const decoded = decodeHtml(el.innerHTML);
          if (!/[<>]/.test(decoded)) {
            el.textContent = decoded;
            el.dataset.gluefulCleaned = "1";
            return;
          }
          const holder = document.createElement("div");
          holder.innerHTML = decoded;
          el.textContent = holder.textContent || holder.innerText || "";
          el.dataset.gluefulCleaned = "1";
        });
      }

      function applyLogos() {
        document.querySelectorAll('.job-logo[data-company-logo="true"], .job-logo[data-company-logo]').forEach(node => {
          const company = String(node.getAttribute("data-company-logo") || "").trim();
          const url = logoCache.get(company.toLowerCase());
          if (!url) return;
          const img = node.querySelector(".job-logo-image");
          const fallback = node.querySelector(".job-logo-fallback");
          if (!img) return;
          if (img.dataset.gluefulLogoUrl !== url) {
            img.dataset.gluefulLogoUrl = url;
            img.src = url;
          }
          img.style.display = "block";
          if (fallback) fallback.style.display = "none";
        });
      }

      async function loadLogos() {
        if (typeof supabaseClient === "undefined") return;
        const nodes = [...document.querySelectorAll(".job-logo[data-company-logo]")];
        const companies = [...new Set(nodes.map(n => String(n.getAttribute("data-company-logo") || "").trim()).filter(Boolean))];
        const missing = companies.filter(name => !logoCache.has(name.toLowerCase()));
        if (!missing.length) {
          applyLogos();
          return;
        }

        try {
          const { data, error } = await supabaseClient
            .from("job_listings")
            .select("company,company_logo_url")
            .in("company", missing)
            .not("company_logo_url", "is", null)
            .limit(500);
          if (error) throw error;
          (data || []).forEach(row => {
            const company = String(row.company || "").trim().toLowerCase();
            const url = String(row.company_logo_url || "").trim();
            if (company && url) logoCache.set(company, url);
          });
          applyLogos();
        } catch (error) {
          console.warn("[Glueful UI] Logo enrichment failed:", error);
        }
      }

      function fixJobsUi() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(async () => {
          scheduled = false;
          cleanJobDescriptions();
          await loadLogos();
        });
      }

      const observer = new MutationObserver(() => fixJobsUi());
      const start = () => {
        const feed = document.getElementById("jobs-feed-list") || document.body;
        observer.observe(feed, { childList: true, subtree: true });
        fixJobsUi();
        setTimeout(fixJobsUi, 800);
        setTimeout(fixJobsUi, 2000);
      };

      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
      else start();
    })();
    </script>`;

    async function patchHtmlResponse(response) {
      if (!response || !response.ok) return response;
      const type = response.headers.get("content-type") || "";
      if (!type.includes("text/html")) return response;
      try {
        const html = await response.text();
        if (html.includes('id="glueful-ui-regression-fix-v1"')) return new Response(html, response);
        const patched = html.includes("</body>")
          ? html.replace("</body>", `${UI_PATCH}</body>`)
          : `${html}${UI_PATCH}`;
        const headers = new Headers(response.headers);
        headers.delete("content-length");
        return new Response(patched, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      } catch (error) {
        console.warn("[Glueful SW] HTML patch failed:", error);
        return response;
      }
    }

    self.addEventListener("install", event => {
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
      self.skipWaiting();
    });

    self.addEventListener("activate", event => {
      event.waitUntil(
        caches.keys().then(keys =>
          Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
      );
      self.clients.claim();
    });

    self.addEventListener("fetch", event => {
      event.respondWith(
        caches.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request)
            .then(async networkResponse => {
              if (event.request.method === "GET" && networkResponse.ok) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
              }
              return patchHtmlResponse(networkResponse);
            })
            .catch(() => cached ? patchHtmlResponse(cached) : cached);

          return cached ? patchHtmlResponse(cached) : fetchPromise;
        })
      );
    });
