const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("glueful-orbit-ui-v9.js", "utf8");

// The chat element is the .ov2-app itself; regressions must not target it as a child.
assert.match(source, /\.ov2-app\.ov2-chat/);
assert.match(source, /\.ov2-chat-messages/);
assert.match(source, /\.ov2-composer/);
assert.match(source, /height:100dvh/);
assert.match(source, /visualViewport/);
assert.match(source, /focusin/);
assert.match(source, /focusout/);
assert.match(source, /__GLUEFUL_ORBIT_UI_V11__/);
assert.match(source, /Do NOT copy visualViewport\.height to the root/);

// Guard against the exact regression shown on Android: the root must never be
// assigned a keyboard-sized visualViewport height such as 420px.
assert.doesNotMatch(source, /const height = Math\.max\(1, Math\.round\(vv\?\.height/);
assert.doesNotMatch(source, /el\.style\.height = `\$\{height\}px`/);

let rootOpen = true;
const root = {
  style: {
    setProperty() {}
  },
  classList: { contains: name => name === "open" && rootOpen }
};
const styles = [];
const listeners = {};
const viewportListeners = {};
const mutations = [];

const document = {
  readyState: "complete",
  documentElement: {},
  head: {
    appendChild(node) {
      styles.push(node);
    }
  },
  createElement(tag) {
    return { tagName: tag.toUpperCase(), id: "", style: {}, textContent: "" };
  },
  getElementById(id) {
    if (id === "glueful-orbit-v2-root") return root;
    return styles.find(node => node.id === id) || null;
  },
  addEventListener() {}
};

const window = {
  innerHeight: 800,
  visualViewport: {
    // Deliberately simulate Android reporting a stale keyboard-sized viewport
    // while the keyboard is closed. This must not shrink the Orbit root.
    height: 420,
    offsetTop: 0,
    addEventListener(type, handler) {
      viewportListeners[type] = handler;
    }
  },
  addEventListener(type, handler) {
    listeners[type] = handler;
  },
  setTimeout,
  clearTimeout
};

function MutationObserver(callback) {
  this.observe = () => mutations.push(callback);
}

const context = {
  window,
  document,
  MutationObserver,
  requestAnimationFrame: callback => {
    callback();
    return 1;
  },
  cancelAnimationFrame() {},
  console
};

vm.runInNewContext(source, context, { filename: "glueful-orbit-ui-v9.js" });

assert.equal(root.style.height, "100dvh", "Orbit root must remain full-screen when visualViewport is stale");
assert.equal(root.style.maxHeight, "none");
assert.equal(root.style.top, "0px");
assert.equal(root.style.bottom, "0px");
assert.equal(styles.length, 1, "v11 should install one layout style block");

// A later viewport resize must still never copy the raw visualViewport height
// to the root. The chat shell uses 100dvh and flex layout for IME behavior.
window.visualViewport.height = 420;
viewportListeners.resize();
assert.equal(root.style.height, "100dvh", "keyboard-sized visualViewport must not shrink Orbit root");
assert.equal(root.style.maxHeight, "none");

window.visualViewport.height = 800;
viewportListeners.resize();
assert.equal(root.style.height, "100dvh", "closing keyboard keeps full dynamic viewport");

rootOpen = false;
window.visualViewport.height = 420;
viewportListeners.resize();
assert.equal(root.style.height, "100dvh", "closed Orbit must not retain viewport sizing");

console.log("Orbit mobile keyboard regression: PASS");
