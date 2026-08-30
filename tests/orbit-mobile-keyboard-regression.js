const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("glueful-orbit-ui-v9.js", "utf8");

assert.match(source, /\.ov2-app \.ov2-chat/);
assert.match(source, /flex:1 1 0 !important/);
assert.match(source, /height:auto !important/);
assert.match(source, /\.ov2-chat \.ov2-composer/);
assert.match(source, /visualViewport/);
assert.match(source, /focusin/);
assert.match(source, /focusout/);
assert.match(source, /__GLUEFUL_ORBIT_UI_V10__/);

let rootOpen = true;
const root = {
  style: {},
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
    height: 800,
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

assert.equal(root.style.height, "800px", "composer viewport should start at the full mobile viewport height");
assert.equal(root.style.maxHeight, "800px");
assert.equal(root.style.top, "0px");
assert.equal(styles.length, 1, "v10 should install one layout style block");

window.visualViewport.height = 420;
window.visualViewport.offsetTop = 0;
viewportListeners.resize();
assert.equal(root.style.height, "420px", "keyboard resize must shrink Orbit to the visual viewport");
assert.equal(root.style.maxHeight, "420px");

window.visualViewport.height = 800;
viewportListeners.resize();
assert.equal(root.style.height, "800px", "closing the keyboard must restore the full viewport");

rootOpen = false;
window.visualViewport.height = 420;
viewportListeners.resize();
assert.equal(root.style.height, "800px", "closed Orbit must not retain keyboard viewport sizing");

console.log("Orbit mobile keyboard regression: PASS");
