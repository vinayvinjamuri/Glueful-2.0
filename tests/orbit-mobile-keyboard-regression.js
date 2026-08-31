const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const orbitSource = fs.readFileSync("glueful-orbit-ui-v16.js", "utf8");
const careerSource = fs.readFileSync("glueful-orbit-career-engine-v1.js", "utf8");
const loaderSource = fs.readFileSync("glueful-gmail-loader-v1.js", "utf8");
const serviceWorkerSource = fs.readFileSync("sw.js", "utf8");

assert.match(loaderSource, /glueful-orbit-ui-v16\.js\?v=1/);
assert.doesNotMatch(loaderSource, /glueful-orbit-ui-v6\.js/);
assert.doesNotMatch(loaderSource, /glueful-orbit-ui-v14\.js/);
assert.doesNotMatch(loaderSource, /glueful-orbit-ui-v15\.js/);
assert.match(serviceWorkerSource, /glueful-orbit-ui-v16\.js/);
assert.match(serviceWorkerSource, /glueful-orbit-career-engine-v1\.js/);
assert.doesNotMatch(serviceWorkerSource, /glueful-orbit-ui-v6\.js/);
assert.doesNotMatch(serviceWorkerSource, /glueful-orbit-ui-v14\.js/);
assert.match(serviceWorkerSource, /interactive-widget=resizes-content/);
assert.match(serviceWorkerSource, /glueful-cache-v108/);

assert.match(orbitSource, /__GLUEFUL_ORBIT_UI_V16__/);
assert.match(orbitSource, /height:100dvh !important/);
assert.match(orbitSource, /position:fixed !important/);
assert.match(orbitSource, /\.ov2-chat-messages/);
assert.match(orbitSource, /overflow-y:auto !important/);
assert.match(orbitSource, /\.ov2-composer/);
assert.match(orbitSource, /flex:0 0 auto !important/);

const orbitExecutableSource = orbitSource.replace(/\/\*[\s\S]*?\*\//g, "");
assert.doesNotMatch(orbitExecutableSource, /visualViewport/);
assert.doesNotMatch(orbitExecutableSource, /window\.scrollTo/);
assert.doesNotMatch(orbitExecutableSource, /root\.style\.height\s*=\s*`/);
assert.match(orbitExecutableSource, /stopImmediatePropagation/);
assert.match(orbitExecutableSource, /orbit-ai/);

assert.match(careerSource, /Career Intelligence/);
assert.match(careerSource, /Build my study plan/);
assert.match(careerSource, /Generate interview questions/);
assert.match(careerSource, /Find my skill gaps/);
assert.match(careerSource, /Explain the highest-priority skills/);
assert.match(careerSource, /sessionStorage/);

const styles = [];
const document = {
  readyState: "complete",
  documentElement: {},
  head: { appendChild(node) { styles.push(node); } },
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(), id: "", textContent: "", async: false, dataset: {},
      setAttribute() {}, getAttribute() { return "width=device-width"; }, appendChild() {}
    };
  },
  querySelector(selector) { if (selector === 'meta[name="viewport"]') return null; return null; },
  addEventListener() {}
};
const root = { dataset: {}, querySelector() { return null; }, addEventListener() {}, classList: { contains(name) { return name === "open"; } } };
document.getElementById = id => id === "glueful-orbit-v2-root" ? root : styles.find(node => node.id === id) || null;
function MutationObserver() { this.observe = () => {}; }
const context = {
  window: { __GLUEFUL_ORBIT_UI_V16__: false, __GLUEFUL_ORBIT_CAREER_ENGINE_V1__: false, addEventListener() {}, localStorage: { getItem() { return null; }, setItem() {} } },
  document, MutationObserver, console, setTimeout, clearTimeout
};
vm.runInNewContext(orbitSource, context, { filename: "glueful-orbit-ui-v16.js" });
assert.equal(styles.length, 1, "v16 should install one style block");
console.log("Orbit mobile IME + career engine regression: PASS");
