const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const loader = fs.readFileSync("glueful-gmail-loader-v1.js", "utf8");
const gmail = fs.readFileSync("glueful-gmail-integration-v1.js", "utf8");

assert.match(loader, /@media \(max-width:700px\)/);
assert.match(loader, /matchMedia\("\(max-width:700px\)"\)/);
assert.match(loader, /MutationObserver/);
assert.match(loader, /if \(!isMobile\(\)\) return/);
assert.match(gmail, /function dashboardHost\(\)/);
assert.match(gmail, /document\.querySelector\("#view-dashboard \.view-header"\)/);
assert.doesNotMatch(gmail, /document\.body\.appendChild\(b\)/);
assert.doesNotMatch(gmail, /#glueful-dashboard-gmail-sync\{position:fixed/);

function runGuardScenario(mobile) {
  let button = { removed: false, remove() { this.removed = true; button = null; } };
  let mutationCallback = null;
  const ids = new Set();
  const context = {
    console,
    setTimeout(fn) { fn(); },
    clearTimeout() {},
    document: {
      readyState: "complete",
      body: {},
      head: { appendChild(node) { if (node.id) ids.add(node.id); } },
      querySelector() { return null; },
      createElement() { return { id: "", textContent: "", dataset: {}, setAttribute() {} }; },
      getElementById(id) {
        if (id === "glueful-sync-control-guard-v3") return ids.has(id) ? { id } : null;
        if (id === "glueful-dashboard-gmail-sync") return button;
        return null;
      },
      addEventListener() {}
    },
    window: {
      setTimeout(fn) { fn(); },
      matchMedia() { return { matches: mobile }; },
      addEventListener() {}
    },
    MutationObserver: class {
      constructor(callback) { mutationCallback = callback; }
      observe() {}
    }
  };

  vm.runInNewContext(loader, context);
  assert.equal(typeof mutationCallback, "function");
  return {
    recreate() {
      button = { removed: false, remove() { this.removed = true; button = null; } };
      mutationCallback();
      return button;
    },
    initialButton() { return button; }
  };
}

const mobile = runGuardScenario(true);
assert.equal(mobile.initialButton(), null, "mobile guard must remove an existing sync control");
const recreatedMobile = mobile.recreate();
assert.equal(recreatedMobile, null, "mobile guard must remove a recreated sync control");

const desktop = runGuardScenario(false);
assert.notEqual(desktop.initialButton(), null, "desktop guard must preserve the sync control");
const recreatedDesktop = desktop.recreate();
assert.notEqual(recreatedDesktop, null, "desktop guard must preserve a recreated sync control");

console.log("Gmail mobile overlay regression: PASS");
