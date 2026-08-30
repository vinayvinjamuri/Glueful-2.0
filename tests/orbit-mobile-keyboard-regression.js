const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const orbitSource = fs.readFileSync("glueful-orbit-ui-v14.js", "utf8");
const loaderSource = fs.readFileSync("glueful-gmail-loader-v1.js", "utf8");
const serviceWorkerSource = fs.readFileSync("sw.js", "utf8");

assert.match(loaderSource, /glueful-orbit-ui-v14\.js\?v=1/);
assert.doesNotMatch(loaderSource, /glueful-orbit-ui-v9\.js/);
assert.match(serviceWorkerSource, /glueful-cache-v106-orbit-v14-ime-fix/);
assert.match(serviceWorkerSource, /glueful-orbit-ui-v14\.js/);
assert.match(serviceWorkerSource, /interactive-widget=resizes-content/);

assert.match(orbitSource, /__GLUEFUL_ORBIT_UI_V14__/);
assert.match(orbitSource, /height:100dvh !important/);
assert.match(orbitSource, /position:fixed !important/);
assert.match(orbitSource, /\.ov2-chat-messages/);
assert.match(orbitSource, /overflow-y:auto !important/);
assert.match(orbitSource, /\.ov2-composer/);
assert.match(orbitSource, /flex:0 0 auto !important/);
assert.match(orbitSource, /scrubLegacyInlineGeometry/);
assert.match(orbitSource, /attributeFilter:\["class", "style"\]/);

// v14 must not recreate the failed v12 architecture.
assert.doesNotMatch(orbitSource, /document\.body\.style\.position\s*=\s*["']fixed/);
assert.doesNotMatch(orbitSource, /document\.body\.style\.top\s*=/);
assert.doesNotMatch(orbitSource, /window\.scrollTo/);
assert.doesNotMatch(orbitSource, /visualViewport\.(?:height|offsetTop)\s*=/);
assert.doesNotMatch(orbitSource, /root\.style\.height\s*=\s*`/);

const root = {
  style: {
    height: "420px",
    maxHeight: "420px",
    top: "0px",
    right: "0px",
    bottom: "auto",
    left: "0px",
    removeProperty(name) {
      const camel = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      delete this[camel];
    }
  },
  classList: {
    contains(name) { return name === "open"; }
  }
};

const styles = [];
let mutationCallback = null;
const documentListeners = {};

const document = {
  readyState: "complete",
  documentElement: {},
  head: {
    appendChild(node) { styles.push(node); }
  },
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      id: "",
      textContent: ""
    };
  },
  getElementById(id) {
    if (id === "glueful-orbit-v2-root") return root;
    return styles.find(node => node.id === id) || null;
  },
  addEventListener(type, handler) {
    documentListeners[type] = handler;
  }
};

function MutationObserver(callback) {
  mutationCallback = callback;
  this.observe = () => {};
}

const context = {
  window: {},
  document,
  MutationObserver,
  console
};

vm.runInNewContext(orbitSource, context, { filename: "glueful-orbit-ui-v14.js" });

assert.equal(styles.length, 1, "v14 should install one style block");
assert.equal(root.style.height, undefined, "legacy inline height must be removed");
assert.equal(root.style.maxHeight, undefined, "legacy inline max-height must be removed");
assert.equal(root.style.top, undefined, "legacy inline top must be removed");
assert.equal(root.style.right, undefined, "legacy inline right must be removed");
assert.equal(root.style.bottom, undefined, "legacy inline bottom must be removed");
assert.equal(root.style.left, undefined, "legacy inline left must be removed");
assert.ok(mutationCallback, "v14 must observe later runtime mutations");

root.style.height = "380px";
root.style.maxHeight = "380px";
root.style.top = "12px";
root.style.bottom = "auto";
mutationCallback();

assert.equal(root.style.height, undefined, "recreated inline height must be removed");
assert.equal(root.style.maxHeight, undefined, "recreated inline max-height must be removed");
assert.equal(root.style.top, undefined, "recreated inline top must be removed");
assert.equal(root.style.bottom, undefined, "recreated inline bottom must be removed");

console.log("Orbit mobile IME regression: PASS");
