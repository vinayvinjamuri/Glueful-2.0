const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("glueful-orbit-ui-v9.js", "utf8");

assert.match(source, /__GLUEFUL_ORBIT_UI_V12__/);
assert.match(source, /\.ov2-app\.ov2-chat/);
assert.match(source, /\.ov2-chat-messages/);
assert.match(source, /\.ov2-composer/);
assert.match(source, /height:100dvh/);
assert.match(source, /visualViewport/);
assert.match(source, /focusin/);
assert.match(source, /focusout/);
assert.match(source, /lockDocumentScroll/);
assert.match(source, /restoreChatAnchor/);
assert.match(source, /wasAtBottom/);

// Guard against the original regression: never copy a raw keyboard-sized
// visualViewport height directly onto the Orbit root.
assert.doesNotMatch(source, /el\.style\.height = `\$\{height\}px`/);
assert.doesNotMatch(source, /const height = Math\.max\(1, Math\.round\(vv\?\.height/);

let rootOpen = true;
let scrollY = 120;
const input = { matches: selector => selector === ".ov2-input" };
const chatMessages = {
  scrollHeight: 1200,
  scrollTop: 900,
  clientHeight: 300
};
const root = {
  style: {},
  classList: { contains: name => name === "open" && rootOpen },
  querySelector: selector => selector === ".ov2-chat-messages" ? chatMessages : null
};
const styles = [];
const listeners = {};
const viewportListeners = {};
const mutations = [];
const documentListeners = {};

const htmlClassSet = new Set();
const bodyClassSet = new Set();
const document = {
  readyState: "complete",
  documentElement: {
    style: {},
    classList: {
      add: name => htmlClassSet.add(name),
      remove: name => htmlClassSet.delete(name),
      contains: name => htmlClassSet.has(name)
    }
  },
  body: {
    style: {},
    classList: {
      add: name => bodyClassSet.add(name),
      remove: name => bodyClassSet.delete(name),
      contains: name => bodyClassSet.has(name)
    }
  },
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
  addEventListener(type, handler) {
    documentListeners[type] = handler;
  }
};

const window = {
  innerHeight: 800,
  scrollY,
  pageYOffset: scrollY,
  visualViewport: {
    // Simulate the stale keyboard-sized value that caused the earlier bug.
    height: 420,
    offsetTop: 0,
    addEventListener(type, handler) {
      viewportListeners[type] = handler;
    }
  },
  addEventListener(type, handler) {
    listeners[type] = handler;
  },
  scrollTo(x, y) {
    scrollY = y;
    this.scrollY = y;
    this.pageYOffset = y;
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

assert.equal(root.style.height, "100dvh", "Orbit root must remain dynamic full-screen");
assert.equal(root.style.maxHeight, "none");
assert.equal(root.style.top, "0px");
assert.equal(root.style.bottom, "0px");
assert.equal(styles.length, 1, "v12 should install one layout style block");

// Opening the keyboard must not move a chat that was already at the bottom.
const focusHandler = listeners.focusin;
assert.ok(focusHandler, "focusin handler must be installed");
focusHandler({ target: input });
assert.equal(htmlClassSet.has("glueful-orbit-scroll-locked"), true);
assert.equal(bodyClassSet.has("glueful-orbit-scroll-locked"), true);
assert.equal(chatMessages.scrollTop, 900, "chat should stay anchored to its bottom before resize");

// With a smaller visual viewport, the root still uses 100dvh rather than a
// stale 420px root height; the message list is the only scrolling region.
window.visualViewport.height = 420;
viewportListeners.resize();
assert.equal(root.style.height, "100dvh");
assert.equal(chatMessages.scrollTop, 900, "keyboard resize must preserve bottom anchor");

// Simulate the chat becoming taller after keyboard close.
window.visualViewport.height = 800;
viewportListeners.resize();
assert.equal(root.style.height, "100dvh");
assert.equal(chatMessages.scrollTop, 900, "closing keyboard must preserve bottom anchor");

rootOpen = false;
viewportListeners.resize();
assert.equal(root.style.height, "100dvh", "closed Orbit must not receive keyboard-sized height");

console.log("Orbit mobile IME scroll-anchor regression: PASS");
